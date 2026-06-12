import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { reconcileWithProvider, restoreFromProvider, syncWithProvider } from '../lib/sync-flow';
import { CLOUD_SYNC_STORAGE_KEY } from './constants';
import {
  CLOUD_SYNC_ERROR_CODES,
  CLOUD_SYNC_STATUSES,
  type CloudProvider,
  type CloudSyncErrorCode,
  type CloudSyncStatus,
} from './types';
import { getCloudSyncProvider } from '../providers';
import { getCloudSyncErrorCode, isCloudSyncCancelledError } from './cloud-sync-error';

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

const setCancelledOperationPoint = (
  providerOperationState: ProviderOperationState,
  provider: CloudProvider,
): ProviderOperationState => {
  return setProviderOperationPoint(providerOperationState, provider, {
    status: CLOUD_SYNC_STATUSES.IDLE,
    errorCode: null,
    operationId: null,
  });
};

export const useCloudSyncStore = create<CloudSyncStore>()(
  persist(
    (set, get) => ({
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

            await provider.connect();

            set((state) => {
              if (!isCurrentOperation(state.providerOperationState, activeProvider, operationId)) {
                return {};
              }

              return {
                providers: setProviderState(state.providers, activeProvider, {
                  connectedAt: new Date().toISOString(),
                }),
                providerOperationState: setProviderOperationPoint(state.providerOperationState, activeProvider, {
                  status: CLOUD_SYNC_STATUSES.IDLE,
                  errorCode: null,
                  operationId: null,
                }),
              };
            });
          } catch (error) {
            set((state) => {
              if (!isCurrentOperation(state.providerOperationState, activeProvider, operationId)) {
                return {};
              }

              if (isCloudSyncCancelledError(error)) {
                return {
                  providerOperationState: setCancelledOperationPoint(state.providerOperationState, activeProvider),
                };
              }

              return {
                providerOperationState: setProviderOperationPoint(state.providerOperationState, activeProvider, {
                  status: CLOUD_SYNC_STATUSES.FAILED,
                  errorCode: getCloudSyncErrorCode(error, CLOUD_SYNC_ERROR_CODES.SYNC_FAILED),
                  operationId: null,
                }),
              };
            });
          }
        },

        syncNow: async () => {
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
            const syncedAt = get().localUpdatedAt ?? new Date().toISOString();
            const syncResult = await syncWithProvider(provider, syncedAt);

            set((state) => {
              if (!isCurrentOperation(state.providerOperationState, activeProvider, operationId)) {
                return {};
              }

              return {
                localUpdatedAt: syncResult.syncedAt,
                providers: setProviderState(state.providers, activeProvider, {
                  lastSyncedAt: syncResult.syncedAt,
                  remoteRevision: syncResult.remoteRevision,
                }),
                providerOperationState: setProviderOperationPoint(state.providerOperationState, activeProvider, {
                  status: CLOUD_SYNC_STATUSES.IDLE,
                  errorCode: null,
                  operationId: null,
                }),
              };
            });
          } catch (error) {
            set((state) => {
              if (!isCurrentOperation(state.providerOperationState, activeProvider, operationId)) {
                return {};
              }

              if (isCloudSyncCancelledError(error)) {
                return {
                  providerOperationState: setCancelledOperationPoint(state.providerOperationState, activeProvider),
                };
              }

              return {
                providerOperationState: setProviderOperationPoint(state.providerOperationState, activeProvider, {
                  status: CLOUD_SYNC_STATUSES.FAILED,
                  errorCode: getCloudSyncErrorCode(error, CLOUD_SYNC_ERROR_CODES.SYNC_FAILED),
                  operationId: null,
                }),
              };
            });
          }
        },

        syncInBackground: async () => {
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
            const providerState = getProviderState(get().providers, activeProvider);
            const localUpdatedAt = get().localUpdatedAt ?? new Date().toISOString();

            const result = await reconcileWithProvider(provider, {
              lastSyncedAt: providerState.lastSyncedAt,
              localUpdatedAt,
              remoteRevision: providerState.remoteRevision,
            });

            set((state) => {
              if (!isCurrentOperation(state.providerOperationState, activeProvider, operationId)) {
                return {};
              }

              return {
                localUpdatedAt: result.localUpdatedAt,
                providers: setProviderState(state.providers, activeProvider, {
                  lastSyncedAt: result.lastSyncedAt,
                  remoteRevision: result.remoteRevision,
                }),
                providerOperationState: setProviderOperationPoint(state.providerOperationState, activeProvider, {
                  status:
                    result.status === CLOUD_SYNC_STATUSES.CONFLICT
                      ? CLOUD_SYNC_STATUSES.CONFLICT
                      : CLOUD_SYNC_STATUSES.IDLE,
                  errorCode: null,
                  operationId: null,
                }),
              };
            });
          } catch (error) {
            set((state) => {
              if (!isCurrentOperation(state.providerOperationState, activeProvider, operationId)) {
                return {};
              }

              if (isCloudSyncCancelledError(error)) {
                return {
                  providerOperationState: setCancelledOperationPoint(state.providerOperationState, activeProvider),
                };
              }

              return {
                providerOperationState: setProviderOperationPoint(state.providerOperationState, activeProvider, {
                  status: CLOUD_SYNC_STATUSES.FAILED,
                  errorCode: getCloudSyncErrorCode(error, CLOUD_SYNC_ERROR_CODES.SYNC_FAILED),
                  operationId: null,
                }),
              };
            });
          }
        },

        restoreFromBackup: async () => {
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
            const restoreResult = await restoreFromProvider(provider);

            if (restoreResult === null) {
              set((state) => {
                if (!isCurrentOperation(state.providerOperationState, activeProvider, operationId)) {
                  return {};
                }

                return {
                  providerOperationState: setProviderOperationPoint(state.providerOperationState, activeProvider, {
                    status: CLOUD_SYNC_STATUSES.FAILED,
                    errorCode: CLOUD_SYNC_ERROR_CODES.BACKUP_NOT_FOUND,
                    operationId: null,
                  }),
                };
              });

              return;
            }

            set((state) => {
              if (!isCurrentOperation(state.providerOperationState, activeProvider, operationId)) {
                return {};
              }

              return {
                localUpdatedAt: restoreResult.syncedAt,
                providers: setProviderState(state.providers, activeProvider, {
                  lastSyncedAt: restoreResult.syncedAt,
                  remoteRevision: restoreResult.remoteRevision,
                }),
                providerOperationState: setProviderOperationPoint(state.providerOperationState, activeProvider, {
                  status: CLOUD_SYNC_STATUSES.IDLE,
                  errorCode: null,
                  operationId: null,
                }),
              };
            });
          } catch (error) {
            set((state) => {
              if (!isCurrentOperation(state.providerOperationState, activeProvider, operationId)) {
                return {};
              }

              if (isCloudSyncCancelledError(error)) {
                return {
                  providerOperationState: setCancelledOperationPoint(state.providerOperationState, activeProvider),
                };
              }

              return {
                providerOperationState: setProviderOperationPoint(state.providerOperationState, activeProvider, {
                  status: CLOUD_SYNC_STATUSES.FAILED,
                  errorCode: getCloudSyncErrorCode(error, CLOUD_SYNC_ERROR_CODES.RESTORE_FAILED),
                  operationId: null,
                }),
              };
            });
          }
        },

        markLocalUpdated: () => {
          set({
            localUpdatedAt: new Date().toISOString(),
          });
        },

        reconcileOnStart: async () => {
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
            const providerState = getProviderState(get().providers, activeProvider);
            const localUpdatedAt = providerState.lastSyncedAt === null ? null : get().localUpdatedAt;

            const result = await reconcileWithProvider(provider, {
              lastSyncedAt: providerState.lastSyncedAt,
              localUpdatedAt,
              remoteRevision: providerState.remoteRevision,
            });

            set((state) => {
              if (!isCurrentOperation(state.providerOperationState, activeProvider, operationId)) {
                return {};
              }

              return {
                localUpdatedAt: result.localUpdatedAt,
                providers: setProviderState(state.providers, activeProvider, {
                  lastSyncedAt: result.lastSyncedAt,
                  remoteRevision: result.remoteRevision,
                }),
                providerOperationState: setProviderOperationPoint(state.providerOperationState, activeProvider, {
                  status:
                    result.status === CLOUD_SYNC_STATUSES.CONFLICT
                      ? CLOUD_SYNC_STATUSES.CONFLICT
                      : CLOUD_SYNC_STATUSES.IDLE,
                  errorCode: null,
                  operationId: null,
                }),
              };
            });
          } catch (error) {
            set((state) => {
              if (!isCurrentOperation(state.providerOperationState, activeProvider, operationId)) {
                return {};
              }

              if (isCloudSyncCancelledError(error)) {
                return {
                  providerOperationState: setCancelledOperationPoint(state.providerOperationState, activeProvider),
                };
              }

              return {
                providerOperationState: setProviderOperationPoint(state.providerOperationState, activeProvider, {
                  status: CLOUD_SYNC_STATUSES.FAILED,
                  errorCode: getCloudSyncErrorCode(error, CLOUD_SYNC_ERROR_CODES.SYNC_FAILED),
                  operationId: null,
                }),
              };
            });
          }
        },
      },
    }),
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
