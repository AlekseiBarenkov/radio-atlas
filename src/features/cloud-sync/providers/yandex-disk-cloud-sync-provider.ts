import type { SyncData } from '../lib/sync-data';
import type { CloudSyncProviderAdapter } from '../model/provider';
import { isYandexDiskAuthError, loadYandexDiskSyncData, saveYandexDiskSyncData } from '../api/yandex-disk';
import { clearYandexDiskAccessToken, requestYandexDiskAccessToken } from '../api/yandex-oauth';
import { useLocalizationStore } from '@/features/localization';

const getAccessToken = async (): Promise<string> => {
  const language = useLocalizationStore.getState().language;

  return requestYandexDiskAccessToken(language);
};
const runWithFreshTokenOnAuthError = async <TResult>(operation: (accessToken: string) => Promise<TResult>) => {
  const accessToken = await getAccessToken();

  try {
    return await operation(accessToken);
  } catch (error) {
    if (!isYandexDiskAuthError(error)) {
      throw error;
    }

    clearYandexDiskAccessToken();

    const refreshedAccessToken = await getAccessToken();

    return operation(refreshedAccessToken);
  }
};

export const yandexDiskCloudSyncProvider: CloudSyncProviderAdapter = {
  load: async () => {
    return runWithFreshTokenOnAuthError((accessToken) => loadYandexDiskSyncData(accessToken));
  },

  save: async (syncData: SyncData) => {
    return runWithFreshTokenOnAuthError((accessToken) => saveYandexDiskSyncData(accessToken, syncData));
  },
};
