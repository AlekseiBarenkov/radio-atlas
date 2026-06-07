import type { SyncData } from '../../lib/sync-data';
import { googleDriveRequest } from './google-drive-request';
import { GOOGLE_DRIVE_UPLOAD_API_BASE_URL, type GoogleDriveFile } from './types';

export const updateGoogleDriveSyncFile = async (
  accessToken: string,
  fileId: string,
  syncData: SyncData,
): Promise<GoogleDriveFile> => {
  return googleDriveRequest<GoogleDriveFile>(
    accessToken,
    `${GOOGLE_DRIVE_UPLOAD_API_BASE_URL}/files/${encodeURIComponent(fileId)}?uploadType=media&fields=id,name,md5Checksum`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(syncData),
    },
  );
};
