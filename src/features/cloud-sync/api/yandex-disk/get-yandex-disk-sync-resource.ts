import { YANDEX_DISK_API_BASE_URL, YANDEX_DISK_SYNC_FILE_PATH, type YandexDiskResource } from './types';
import { isYandexDiskNotFoundError, yandexDiskRequest } from './yandex-disk-request';

export const getYandexDiskSyncResource = async (accessToken: string): Promise<YandexDiskResource | null> => {
  const searchParams = new URLSearchParams({
    path: YANDEX_DISK_SYNC_FILE_PATH,
    fields: 'md5',
  });

  try {
    return await yandexDiskRequest<YandexDiskResource>(
      accessToken,
      `${YANDEX_DISK_API_BASE_URL}/resources?${searchParams.toString()}`,
    );
  } catch (error) {
    if (isYandexDiskNotFoundError(error)) {
      return null;
    }

    throw error;
  }
};
