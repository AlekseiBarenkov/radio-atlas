export const GOOGLE_DRIVE_SYNC_FILE_NAME = 'radio-atlas-sync.json';
export const GOOGLE_DRIVE_API_BASE_URL = 'https://www.googleapis.com/drive/v3';
export const GOOGLE_DRIVE_UPLOAD_API_BASE_URL = 'https://www.googleapis.com/upload/drive/v3';

export type GoogleDriveFile = {
  id: string;
  name: string;
  md5Checksum?: string;
};

export type GoogleDriveFilesListResponse = {
  files?: GoogleDriveFile[];
};
