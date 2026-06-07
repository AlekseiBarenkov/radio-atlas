import type { SyncRemoteBackup } from '../../lib/sync-data';
import { parseSyncData } from '../../lib/sync-data';
import { YANDEX_DISK_API_BASE_URL, YANDEX_DISK_SYNC_FILE_PATH, type YandexDiskResourceLink } from './types';
import { getYandexDiskSyncResource } from './get-yandex-disk-sync-resource';
import { YandexDiskRequestError, yandexDiskRequest } from './yandex-disk-request';

export const loadYandexDiskSyncData = async (accessToken: string): Promise<SyncRemoteBackup | null> => {
  const syncResource = await getYandexDiskSyncResource(accessToken);

  if (syncResource === null) {
    return null;
  }

  const searchParams = new URLSearchParams({
    path: YANDEX_DISK_SYNC_FILE_PATH,
  });

  const downloadLink = await yandexDiskRequest<YandexDiskResourceLink>(
    accessToken,
    `${YANDEX_DISK_API_BASE_URL}/resources/download?${searchParams.toString()}`,
  );

  const response = await fetch(downloadLink.href, {
    method: downloadLink.method ?? 'GET',
    referrerPolicy: 'no-referrer',
  });

  if (!response.ok) {
    throw new YandexDiskRequestError(response.status);
  }

  const syncData = parseSyncData(await response.text());

  if (syncData === null) {
    throw new Error('Invalid Yandex Disk sync data');
  }

  return {
    syncData,
    remoteRevision: syncResource.md5 ?? null,
  };
};
