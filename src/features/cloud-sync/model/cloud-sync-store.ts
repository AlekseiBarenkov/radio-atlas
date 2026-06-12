import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { reconcileWithProvider, restoreFromProvider, syncWithProvider } from '../lib/sync-flow';
import { getCloudSyncProvider } from '../providers';
import { getCloudSyncErrorCode, isCloudSyncCancelledError } from './cloud-sync-error';
import { CLOUD_SYNC_STORAGE_KEY } from './constants';
import type { CloudSyncProviderAdapter } from './provider';
import {
  CLOUD_SYNC_ERROR_CODES,
  CLOUD_SYNC_STATUSES,
  type CloudProvider,
  type CloudSyncErrorCode,
  type CloudSyncStatus,
} from './types';

type CloudProviderState = {
  connectedAt: string | null;
  autoSyncEnabled: boolean;
  lastSyncedAt: string | null;
  remoteRevision: string | null;
};

type CloudProviderOperationState = {
  status: CloudSyncStatus;
  errorCode: CloudSyncErrorCode | null;
  operationId: string | null;
};

type ProviderState = Partial<Record<CloudProvider, CloudProviderState>>;
type ProviderOperationState = Partial<Record<CloudProvider, CloudProviderOperationState>>;

type CloudSyncState = {
  activeProvider: CloudProvider | null;
  localUpdatedAt: string | null;
  providers: ProviderState;
  providerOperationState: ProviderOperationState;
};

type CloudSyncActions = {
  setActiveProvider: (provider: CloudProvider | null) => void;
  setAutoSyncEnabled: (enabled: boolean) => void;
  connectProvider: () => Promise<void>;
  syncNow: () => Promise<void>;
  syncInBackground: () => Promise<void>;
  restoreFromBackup: () => Promise<void>;
  reconcileOnStart: () => Promise<void>;
  markLocalUpdated: () => void;
};

export type CloudSyncStore = CloudSyncState & {
  actions: CloudSyncActions;
};

type ProviderOperationContext = {
  activeProvider: CloudProvider;
  provider: CloudSyncProviderAdapter;
};

type ProviderOperationResult = {
  status?: CloudSyncStatus;
  errorCode?: CloudSyncErrorCode | null;
  buildState?: (state: CloudSyncStore) => Partial<CloudSyncState>;
};

const createDefaultProviderState = (): CloudProviderState => ({
  connectedAt: null,
  autoSyncEnabled: false,
  lastSyncedAt: null,
  remoteRevision: null,
});

const getProviderState = (providers: ProviderState, provider: CloudProvider): CloudProviderState => ({
  ...createDefaultProviderState(),
  ...providers[provider],
});

const getProviderOperationPoint = (
  providerOperationState: ProviderOperationState,
  provider: CloudProvider,
): CloudProviderOperationState => {
  return (
    providerOperationState[provider] ?? {
      status: CLOUD_SYNC_STATUSES.IDLE,
      errorCode: null,
      operationId: null,
    }
  );
};

const setProviderState = (
  providers: ProviderState,
  provider: CloudProvider,
  providerState: Partial<CloudProviderState>,
): ProviderState => ({
  ...providers,
  [provider]: {
    ...getProviderState(providers, provider),
    ...providerState,
  },
});

const setProviderOperationPoint = (
  providerOperationState: ProviderOperationState,
  provider: CloudProvider,
  operationPoint: CloudProviderOperationState,
): ProviderOperationState => ({
  ...providerOperationState,
  [provider]: operationPoint,
});

const setFinishedOperationPoint = (
  providerOperationState: ProviderOperationState,
  provider: CloudProvider,
  status: CloudSyncStatus = CLOUD_SYNC_STATUSES.IDLE,
  errorCode: CloudSyncErrorCode | null = null,
): ProviderOperationState => {
  return setProviderOperationPoint(providerOperationState, provider, {
    status,
    errorCode,
    operationId: null,
  });
};

const isProviderSyncing = (providerOperationState: ProviderOperationState, provider: CloudProvider): boolean => {
  return getProviderOperationPoint(providerOperationState, provider).status === CLOUD_SYNC_STATUSES.SYNCING;
};

const isCurrentOperation = (
  providerOperationState: ProviderOperationState,
  provider: CloudProvider,
  operationId: string,
): boolean => {
  return getProviderOperationPoint(providerOperationState, provider).operationId === operationId;
};

export const useCloudSyncStore = create<CloudSyncStore>()(
  persist(
    (set, get) => {
      const runProviderOperation = async (
        fallbackCode: CloudSyncErrorCode,
        operation: (context: ProviderOperationContext) => Promise<ProviderOperationResult>,
      ): Promise<void> => {
        const activeProvider = get().activeProvider;

        if (activeProvider === null || isProviderSyncing(get().providerOperationState, activeProvider)) {
          return;
        }

        const operationId = crypto.randomUUID();

        set((state) => ({
          providerOperationState: setProviderOperationPoint(state.providerOperationState, activeProvider, {
            status: CLOUD_SYNC_STATUSES.SYNCING,
            errorCode: null,
            operationId,
          }),
        }));

        try {
          const provider = getCloudSyncProvider(activeProvider);
          const result = await operation({ activeProvider, provider });

          set((state) => {
            if (!isCurrentOperation(state.providerOperationState, activeProvider, operationId)) {
              return {};
            }

            return {
              ...(result.buildState?.(state) ?? {}),
              providerOperationState: setFinishedOperationPoint(
                state.providerOperationState,
                activeProvider,
                result.status ?? CLOUD_SYNC_STATUSES.IDLE,
                result.errorCode ?? null,
              ),
            };
          });
        } catch (error) {
          set((state) => {
            if (!isCurrentOperation(state.providerOperationState, activeProvider, operationId)) {
              return {};
            }

            if (isCloudSyncCancelledError(error)) {
              return {
                providerOperationState: setFinishedOperationPoint(state.providerOperationState, activeProvider),
              };
            }

            return {
              providerOperationState: setFinishedOperationPoint(
                state.providerOperationState,
                activeProvider,
                CLOUD_SYNC_STATUSES.FAILED,
                getCloudSyncErrorCode(error, fallbackCode),
              ),
            };
          });
        }
      };

      return {
        activeProvider: null,
        localUpdatedAt: null,
        providers: {},
        providerOperationState: {},

        actions: {
          setActiveProvider: (provider) => {
            set((state) => {
              if (provider === null || provider === state.activeProvider) {
                return {
                  activeProvider: provider,
                };
              }

              return {
                activeProvider: provider,
                providers: setProviderState(state.providers, provider, {
                  autoSyncEnabled: false,
                }),
              };
            });
          },

          setAutoSyncEnabled: (enabled) => {
            const activeProvider = get().activeProvider;

            if (activeProvider === null) {
              return;
            }

            set((state) => ({
              providers: setProviderState(state.providers, activeProvider, {
                autoSyncEnabled: enabled,
              }),
            }));
          },

          connectProvider: async () => {
            await runProviderOperation(CLOUD_SYNC_ERROR_CODES.SYNC_FAILED, async ({ activeProvider, provider }) => {
              await provider.connect();

              return {
                buildState: (state) => ({
                  providers: setProviderState(state.providers, activeProvider, {
                    connectedAt: new Date().toISOString(),
                  }),
                }),
              };
            });
          },

          syncNow: async () => {
            await runProviderOperation(CLOUD_SYNC_ERROR_CODES.SYNC_FAILED, async ({ activeProvider, provider }) => {
              const syncedAt = get().localUpdatedAt ?? new Date().toISOString();
              const syncResult = await syncWithProvider(provider, syncedAt);

              return {
                buildState: (state) => ({
                  localUpdatedAt: syncResult.syncedAt,
                  providers: setProviderState(state.providers, activeProvider, {
                    lastSyncedAt: syncResult.syncedAt,
                    remoteRevision: syncResult.remoteRevision,
                  }),
                }),
              };
            });
          },

          syncInBackground: async () => {
            await runProviderOperation(CLOUD_SYNC_ERROR_CODES.SYNC_FAILED, async ({ activeProvider, provider }) => {
              const providerState = getProviderState(get().providers, activeProvider);
              const localUpdatedAt = get().localUpdatedAt ?? new Date().toISOString();

              const result = await reconcileWithProvider(provider, {
                lastSyncedAt: providerState.lastSyncedAt,
                localUpdatedAt,
                remoteRevision: providerState.remoteRevision,
              });

              return {
                status:
                  result.status === CLOUD_SYNC_STATUSES.CONFLICT
                    ? CLOUD_SYNC_STATUSES.CONFLICT
                    : CLOUD_SYNC_STATUSES.IDLE,
                buildState: (state) => ({
                  localUpdatedAt: result.localUpdatedAt,
                  providers: setProviderState(state.providers, activeProvider, {
                    lastSyncedAt: result.lastSyncedAt,
                    remoteRevision: result.remoteRevision,
                  }),
                }),
              };
            });
          },

          restoreFromBackup: async () => {
            await runProviderOperation(CLOUD_SYNC_ERROR_CODES.RESTORE_FAILED, async ({ activeProvider, provider }) => {
              const restoreResult = await restoreFromProvider(provider);

              if (restoreResult === null) {
                return {
                  status: CLOUD_SYNC_STATUSES.FAILED,
                  errorCode: CLOUD_SYNC_ERROR_CODES.BACKUP_NOT_FOUND,
                };
              }

              return {
                buildState: (state) => ({
                  localUpdatedAt: restoreResult.syncedAt,
                  providers: setProviderState(state.providers, activeProvider, {
                    lastSyncedAt: restoreResult.syncedAt,
                    remoteRevision: restoreResult.remoteRevision,
                  }),
                }),
              };
            });
          },

          reconcileOnStart: async () => {
            await runProviderOperation(CLOUD_SYNC_ERROR_CODES.SYNC_FAILED, async ({ activeProvider, provider }) => {
              const providerState = getProviderState(get().providers, activeProvider);
              const localUpdatedAt = providerState.lastSyncedAt === null ? null : get().localUpdatedAt;

              const result = await reconcileWithProvider(provider, {
                lastSyncedAt: providerState.lastSyncedAt,
                localUpdatedAt,
                remoteRevision: providerState.remoteRevision,
              });

              return {
                status:
                  result.status === CLOUD_SYNC_STATUSES.CONFLICT
                    ? CLOUD_SYNC_STATUSES.CONFLICT
                    : CLOUD_SYNC_STATUSES.IDLE,
                buildState: (state) => ({
                  localUpdatedAt: result.localUpdatedAt,
                  providers: setProviderState(state.providers, activeProvider, {
                    lastSyncedAt: result.lastSyncedAt,
                    remoteRevision: result.remoteRevision,
                  }),
                }),
              };
            });
          },

          markLocalUpdated: () => {
            set({
              localUpdatedAt: new Date().toISOString(),
            });
          },
        },
      };
    },
    {
      name: CLOUD_SYNC_STORAGE_KEY,
      partialize: (state) => ({
        activeProvider: state.activeProvider,
        localUpdatedAt: state.localUpdatedAt,
        providers: state.providers,
      }),
    },
  ),
);
