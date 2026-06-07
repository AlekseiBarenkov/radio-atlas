import type { CloudSyncProviderAdapter } from '../../model/provider';
import { applySyncData } from '../sync-data';

type RestoreFromProviderResult = {
  syncedAt: string;
  remoteRevision: string | null;
};

export const restoreFromProvider = async (
  provider: CloudSyncProviderAdapter,
): Promise<RestoreFromProviderResult | null> => {
  const remoteBackup = await provider.load();

  if (remoteBackup === null) {
    return null;
  }

  applySyncData(remoteBackup.syncData);

  return {
    syncedAt: remoteBackup.syncData.updatedAt,
    remoteRevision: remoteBackup.remoteRevision,
  };
};
