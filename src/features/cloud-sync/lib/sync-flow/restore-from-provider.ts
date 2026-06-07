import type { CloudSyncProviderAdapter } from '../../model/provider';
import { applySyncData } from '../sync-data';

export const restoreFromProvider = async (provider: CloudSyncProviderAdapter): Promise<string | null> => {
  const remoteSyncData = await provider.load();

  if (remoteSyncData === null) {
    return null;
  }

  applySyncData(remoteSyncData);

  return remoteSyncData.updatedAt;
};
