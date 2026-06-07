import type { SyncData } from '../../lib/sync-data';
import { googleDriveRequestNoContent } from './google-drive-request';
import { GOOGLE_DRIVE_UPLOAD_API_BASE_URL } from './types';

export const updateGoogleDriveSyncFile = async (
  accessToken: string,
  fileId: string,
  syncData: SyncData,
): Promise<void> => {
  await googleDriveRequestNoContent(
    accessToken,
    `${GOOGLE_DRIVE_UPLOAD_API_BASE_URL}/files/${encodeURIComponent(fileId)}?uploadType=media`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(syncData),
    },
  );
};
