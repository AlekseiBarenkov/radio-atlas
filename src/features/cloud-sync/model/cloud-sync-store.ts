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
import { getCloudSyncErrorCode } from './cloud-sync-error';

type CloudProviderSyncState = {
  lastSyncedAt: string | null;
  remoteRevision: string | null;
};

type CloudProviderOperationState = {
  status: CloudSyncStatus;
  errorCode: CloudSyncErrorCode | null;
  operationId: string | null;
};

type CloudProviderConnectionState = {
  connectedAt: string | null;
};

type ProviderSyncState = Partial<Record<CloudProvider, CloudProviderSyncState>>;
type ProviderOperationState = Partial<Record<CloudProvider, CloudProviderOperationState>>;
type ProviderConnectionState = Partial<Record<CloudProvider, CloudProviderConnectionState>>;
type ProviderAutoSyncState = Partial<Record<CloudProvider, boolean>>;

type CloudSyncState = {
  activeProvider: CloudProvider | null;
  providerAutoSyncState: ProviderAutoSyncState;
  providerConnectionState: ProviderConnectionState;
  localUpdatedAt: string | null;
  providerSyncState: ProviderSyncState;
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

const getProviderSyncPoint = (
  providerSyncState: ProviderSyncState,
  provider: CloudProvider,
): CloudProviderSyncState => {
  const syncPoint = providerSyncState[provider];

  return {
    lastSyncedAt: syncPoint?.lastSyncedAt ?? null,
    remoteRevision: syncPoint?.remoteRevision ?? null,
  };
};

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

const setProviderSyncPoint = (
  providerSyncState: ProviderSyncState,
  provider: CloudProvider,
  syncPoint: CloudProviderSyncState,
): ProviderSyncState => ({
  ...providerSyncState,
  [provider]: syncPoint,
});

const setProviderOperationPoint = (
  providerOperationState: ProviderOperationState,
  provider: CloudProvider,
  operationPoint: CloudProviderOperationState,
): ProviderOperationState => ({
  ...providerOperationState,
  [provider]: operationPoint,
});

const setProviderConnectionPoint = (
  providerConnectionState: ProviderConnectionState,
  provider: CloudProvider,
  connectionPoint: CloudProviderConnectionState,
): ProviderConnectionState => ({
  ...providerConnectionState,
  [provider]: connectionPoint,
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

export const useCloudSyncStore = create<CloudSyncStore>()(
  persist(
    (set, get) => ({
      activeProvider: null,
      providerAutoSyncState: {},
      providerConnectionState: {},
      localUpdatedAt: null,
      providerSyncState: {},
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
              providerAutoSyncState: {
                ...state.providerAutoSyncState,
                [provider]: false,
              },
            };
          });
        },

        setAutoSyncEnabled: (enabled) => {
          const activeProvider = get().activeProvider;

          if (activeProvider === null) {
            return;
          }

          set((state) => ({
            providerAutoSyncState: {
              ...state.providerAutoSyncState,
              [activeProvider]: enabled,
            },
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
                providerConnectionState: setProviderConnectionPoint(state.providerConnectionState, activeProvider, {
                  connectedAt: new Date().toISOString(),
                }),
                providerOperationState: setProviderOperationPoint(state.providerOperationState, activeProvider, {
                  status: CLOUD_SYNC_STATUSES.SYNCED,
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
                providerSyncState: setProviderSyncPoint(state.providerSyncState, activeProvider, {
                  lastSyncedAt: syncResult.syncedAt,
                  remoteRevision: syncResult.remoteRevision,
                }),
                providerOperationState: setProviderOperationPoint(state.providerOperationState, activeProvider, {
                  status: CLOUD_SYNC_STATUSES.SYNCED,
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
            const syncPoint = getProviderSyncPoint(get().providerSyncState, activeProvider);
            const localUpdatedAt = get().localUpdatedAt ?? new Date().toISOString();

            const result = await reconcileWithProvider(provider, {
              lastSyncedAt: syncPoint.lastSyncedAt,
              localUpdatedAt,
              remoteRevision: syncPoint.remoteRevision,
            });

            set((state) => {
              if (!isCurrentOperation(state.providerOperationState, activeProvider, operationId)) {
                return {};
              }

              return {
                localUpdatedAt: result.localUpdatedAt,
                providerSyncState: setProviderSyncPoint(state.providerSyncState, activeProvider, {
                  lastSyncedAt: result.lastSyncedAt,
                  remoteRevision: result.remoteRevision,
                }),
                providerOperationState: setProviderOperationPoint(state.providerOperationState, activeProvider, {
                  status: result.status,
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
                providerSyncState: setProviderSyncPoint(state.providerSyncState, activeProvider, {
                  lastSyncedAt: restoreResult.syncedAt,
                  remoteRevision: restoreResult.remoteRevision,
                }),
                providerOperationState: setProviderOperationPoint(state.providerOperationState, activeProvider, {
                  status: CLOUD_SYNC_STATUSES.SYNCED,
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
            const syncPoint = getProviderSyncPoint(get().providerSyncState, activeProvider);
            const localUpdatedAt = syncPoint.lastSyncedAt === null ? null : get().localUpdatedAt;

            const result = await reconcileWithProvider(provider, {
              lastSyncedAt: syncPoint.lastSyncedAt,
              localUpdatedAt,
              remoteRevision: syncPoint.remoteRevision,
            });

            set((state) => {
              if (!isCurrentOperation(state.providerOperationState, activeProvider, operationId)) {
                return {};
              }

              return {
                localUpdatedAt: result.localUpdatedAt,
                providerSyncState: setProviderSyncPoint(state.providerSyncState, activeProvider, {
                  lastSyncedAt: result.lastSyncedAt,
                  remoteRevision: result.remoteRevision,
                }),
                providerOperationState: setProviderOperationPoint(state.providerOperationState, activeProvider, {
                  status: result.status,
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
        providerAutoSyncState: state.providerAutoSyncState,
        providerConnectionState: state.providerConnectionState,
        localUpdatedAt: state.localUpdatedAt,
        providerSyncState: state.providerSyncState,
      }),
    },
  ),
);
