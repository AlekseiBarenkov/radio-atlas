import type { SyncData, SyncRemoteBackup, SyncSaveResult } from '../lib/sync-data';

export type CloudSyncProviderAdapter = {
  connect: () => Promise<void>;
  load: () => Promise<SyncRemoteBackup | null>;
  save: (syncData: SyncData) => Promise<SyncSaveResult>;
};
