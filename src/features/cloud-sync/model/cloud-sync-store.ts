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

type CloudSyncState = {
  activeProvider: CloudProvider | null;
  autoSyncEnabled: boolean;
  lastSyncedAt: string | null;
  status: CloudSyncStatus;
  errorCode: CloudSyncErrorCode | null;
  localUpdatedAt: string | null;
};

type CloudSyncActions = {
  setActiveProvider: (provider: CloudProvider | null) => void;
  setAutoSyncEnabled: (enabled: boolean) => void;
  syncNow: () => Promise<void>;
  syncInBackground: () => Promise<void>;
  restoreFromBackup: () => Promise<void>;
  reconcileOnStart: () => Promise<void>;
  markLocalUpdated: () => void;
};

export type CloudSyncStore = CloudSyncState & {
  actions: CloudSyncActions;
};

export const useCloudSyncStore = create<CloudSyncStore>()(
  persist(
    (set, get) => ({
      activeProvider: null,
      autoSyncEnabled: false,
      lastSyncedAt: null,
      status: CLOUD_SYNC_STATUSES.IDLE,
      errorCode: null,
      localUpdatedAt: null,

      actions: {
        setActiveProvider: (provider) => {
          set({
            activeProvider: provider,
            status: CLOUD_SYNC_STATUSES.IDLE,
            errorCode: null,
          });
        },

        setAutoSyncEnabled: (enabled) => {
          set({
            autoSyncEnabled: enabled,
          });
        },

        syncNow: async () => {
          const activeProvider = get().activeProvider;

          if (activeProvider === null) {
            return;
          }

          set({
            status: CLOUD_SYNC_STATUSES.SYNCING,
            errorCode: null,
          });

          try {
            const provider = getCloudSyncProvider();
            const syncedAt = get().localUpdatedAt ?? new Date().toISOString();
            const lastSyncedAt = await syncWithProvider(provider, syncedAt);

            set({
              status: CLOUD_SYNC_STATUSES.SYNCED,
              lastSyncedAt,
              localUpdatedAt: lastSyncedAt,
              errorCode: null,
            });
          } catch (error) {
            set({
              status: CLOUD_SYNC_STATUSES.FAILED,
              errorCode: getCloudSyncErrorCode(error, CLOUD_SYNC_ERROR_CODES.SYNC_FAILED),
            });
          }
        },

        syncInBackground: async () => {
          const activeProvider = get().activeProvider;

          if (activeProvider === null) {
            return;
          }

          set({
            status: CLOUD_SYNC_STATUSES.SYNCING,
            errorCode: null,
          });

          try {
            const provider = getCloudSyncProvider();
            const localUpdatedAt = get().localUpdatedAt ?? new Date().toISOString();
            const lastSyncedAt = await syncWithProvider(provider, localUpdatedAt);

            set({
              status: CLOUD_SYNC_STATUSES.SYNCED,
              lastSyncedAt,
              localUpdatedAt: lastSyncedAt,
              errorCode: null,
            });
          } catch (error) {
            set({
              status: CLOUD_SYNC_STATUSES.FAILED,
              errorCode: getCloudSyncErrorCode(error, CLOUD_SYNC_ERROR_CODES.SYNC_FAILED),
            });
          }
        },

        restoreFromBackup: async () => {
          const activeProvider = get().activeProvider;

          if (activeProvider === null) {
            return;
          }

          set({
            status: CLOUD_SYNC_STATUSES.SYNCING,
            errorCode: null,
          });

          try {
            const provider = getCloudSyncProvider();
            const lastSyncedAt = await restoreFromProvider(provider);

            if (lastSyncedAt === null) {
              set({
                status: CLOUD_SYNC_STATUSES.FAILED,
                errorCode: CLOUD_SYNC_ERROR_CODES.BACKUP_NOT_FOUND,
              });

              return;
            }

            set({
              status: CLOUD_SYNC_STATUSES.SYNCED,
              lastSyncedAt,
              localUpdatedAt: lastSyncedAt,
              errorCode: null,
            });
          } catch (error) {
            set({
              status: CLOUD_SYNC_STATUSES.FAILED,
              errorCode: getCloudSyncErrorCode(error, CLOUD_SYNC_ERROR_CODES.RESTORE_FAILED),
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

          if (activeProvider === null) {
            return;
          }

          set({
            status: CLOUD_SYNC_STATUSES.SYNCING,
            errorCode: null,
          });

          try {
            const result = await reconcileWithProvider(getCloudSyncProvider(), {
              lastSyncedAt: get().lastSyncedAt,
              localUpdatedAt: get().localUpdatedAt,
            });

            set({
              status: result.status,
              lastSyncedAt: result.lastSyncedAt,
              localUpdatedAt: result.localUpdatedAt,
              errorCode: null,
            });
          } catch (error) {
            set({
              status: CLOUD_SYNC_STATUSES.FAILED,
              errorCode: getCloudSyncErrorCode(error, CLOUD_SYNC_ERROR_CODES.SYNC_FAILED),
            });
          }
        },
      },
    }),
    {
      name: CLOUD_SYNC_STORAGE_KEY,
      partialize: (state) => ({
        activeProvider: state.activeProvider,
        autoSyncEnabled: state.autoSyncEnabled,
        lastSyncedAt: state.lastSyncedAt,
        localUpdatedAt: state.localUpdatedAt,
      }),
    },
  ),
);
