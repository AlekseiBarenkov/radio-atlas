import type { SyncData } from '../lib/sync-data';

export type CloudSyncProviderAdapter = {
  load: () => Promise<SyncData | null>;
  save: (syncData: SyncData) => Promise<void>;
};
