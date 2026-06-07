import type { CloudSyncProviderAdapter } from '../model/provider';
import { CLOUD_PROVIDERS, type CloudProvider } from '../model/types';
import { googleDriveCloudSyncProvider } from './google-drive-cloud-sync-provider';
import { yandexDiskCloudSyncProvider } from './yandex-disk-cloud-sync-provider';

const cloudSyncProviders: Record<CloudProvider, CloudSyncProviderAdapter> = {
  [CLOUD_PROVIDERS.GOOGLE_DRIVE]: googleDriveCloudSyncProvider,
  [CLOUD_PROVIDERS.YANDEX_DISK]: yandexDiskCloudSyncProvider,
};

export const getCloudSyncProvider = (provider: CloudProvider): CloudSyncProviderAdapter => {
  return cloudSyncProviders[provider];
};
