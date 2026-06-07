import type { CloudSyncProviderAdapter } from '../../model/provider';
import { buildSyncData } from '../sync-data';

type SyncWithProviderResult = {
  syncedAt: string;
  remoteRevision: string | null;
};

export const syncWithProvider = async (
  provider: CloudSyncProviderAdapter,
  syncedAt?: string,
): Promise<SyncWithProviderResult> => {
  const localSyncData = buildSyncData(syncedAt);
  const saveResult = await provider.save(localSyncData);

  return {
    syncedAt: localSyncData.updatedAt,
    remoteRevision: saveResult.remoteRevision,
  };
};
