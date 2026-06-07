import type { SyncData, SyncSaveResult } from '../../lib/sync-data';
import { getYandexDiskSyncResource } from './get-yandex-disk-sync-resource';
import { YandexDiskRequestError, yandexDiskRequest } from './yandex-disk-request';
import { YANDEX_DISK_API_BASE_URL, YANDEX_DISK_SYNC_FILE_PATH, type YandexDiskResourceLink } from './types';

export const saveYandexDiskSyncData = async (accessToken: string, syncData: SyncData): Promise<SyncSaveResult> => {
  const searchParams = new URLSearchParams({
    path: YANDEX_DISK_SYNC_FILE_PATH,
    overwrite: 'true',
  });

  const uploadLink = await yandexDiskRequest<YandexDiskResourceLink>(
    accessToken,
    `${YANDEX_DISK_API_BASE_URL}/resources/upload?${searchParams.toString()}`,
  );

  const response = await fetch(uploadLink.href, {
    method: uploadLink.method ?? 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(syncData),
    referrerPolicy: 'no-referrer',
  });

  if (!response.ok) {
    throw new YandexDiskRequestError(response.status);
  }

  const syncResource = await getYandexDiskSyncResource(accessToken);

  return {
    remoteRevision: syncResource?.md5 ?? null,
  };
};
