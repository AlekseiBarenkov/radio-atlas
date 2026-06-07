import { googleDriveRequest } from './google-drive-request';
import { GOOGLE_DRIVE_SYNC_FILE_NAME, GOOGLE_DRIVE_UPLOAD_API_BASE_URL, type GoogleDriveFile } from './types';
import type { SyncData } from '../../lib/sync-data';

export const createGoogleDriveSyncFile = async (accessToken: string, syncData: SyncData): Promise<GoogleDriveFile> => {
  const formData = new FormData();

  formData.append(
    'metadata',
    new Blob(
      [
        JSON.stringify({
          name: GOOGLE_DRIVE_SYNC_FILE_NAME,
          parents: ['appDataFolder'],
        }),
      ],
      { type: 'application/json' },
    ),
  );

  formData.append('file', new Blob([JSON.stringify(syncData)], { type: 'application/json' }));

  return googleDriveRequest<GoogleDriveFile>(
    accessToken,
    `${GOOGLE_DRIVE_UPLOAD_API_BASE_URL}/files?uploadType=multipart&fields=id,name`,
    {
      method: 'POST',
      body: formData,
    },
  );
};
