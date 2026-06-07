import type { CloudSyncProviderAdapter } from '../../model/provider';
import { buildSyncData } from '../sync-data';

export const syncWithProvider = async (provider: CloudSyncProviderAdapter, syncedAt?: string): Promise<string> => {
  const localSyncData = buildSyncData(syncedAt);

  await provider.save(localSyncData);

  return localSyncData.updatedAt;
};
