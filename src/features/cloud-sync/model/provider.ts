import type { SyncData, SyncRemoteBackup, SyncSaveResult } from '../lib/sync-data';

export type CloudSyncProviderAdapter = {
  load: () => Promise<SyncRemoteBackup | null>;
  save: (syncData: SyncData) => Promise<SyncSaveResult>;
};
