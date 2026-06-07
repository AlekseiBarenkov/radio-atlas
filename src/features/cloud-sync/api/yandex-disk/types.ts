export const YANDEX_DISK_API_BASE_URL = 'https://cloud-api.yandex.net/v1/disk';
export const YANDEX_DISK_SYNC_FILE_PATH = 'app:/radio-atlas-sync.json';

export type YandexDiskResource = {
  md5?: string;
};

export type YandexDiskResourceLink = {
  href: string;
  method?: string;
  templated?: boolean;
};
