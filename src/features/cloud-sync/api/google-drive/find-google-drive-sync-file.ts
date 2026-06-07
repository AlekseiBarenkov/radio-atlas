import { googleDriveRequest } from './google-drive-request';
import {
  GOOGLE_DRIVE_API_BASE_URL,
  GOOGLE_DRIVE_SYNC_FILE_NAME,
  type GoogleDriveFile,
  type GoogleDriveFilesListResponse,
} from './types';

export const findGoogleDriveSyncFile = async (accessToken: string): Promise<GoogleDriveFile | null> => {
  const searchParams = new URLSearchParams({
    spaces: 'appDataFolder',
    fields: 'files(id,name)',
    q: `name = '${GOOGLE_DRIVE_SYNC_FILE_NAME}' and trashed = false`,
  });

  const response = await googleDriveRequest<GoogleDriveFilesListResponse>(
    accessToken,
    `${GOOGLE_DRIVE_API_BASE_URL}/files?${searchParams.toString()}`,
  );

  return response.files?.[0] ?? null;
};
