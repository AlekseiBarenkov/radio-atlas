import type { CloudSyncProviderAdapter } from '../model/provider';
import { googleDriveCloudSyncProvider } from './google-drive-cloud-sync-provider';

export const getCloudSyncProvider = (): CloudSyncProviderAdapter => {
  return googleDriveCloudSyncProvider;
};
