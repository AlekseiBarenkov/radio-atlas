import { GOOGLE_DRIVE_API_BASE_URL } from './types';
import { googleDriveRequest } from './google-drive-request';
import type { SyncData } from '../../lib/sync-data';
import { parseSyncData } from '../../lib/sync-data';

export const loadGoogleDriveSyncData = async (accessToken: string, fileId: string): Promise<SyncData | null> => {
  const rawValue = await googleDriveRequest<unknown>(
    accessToken,
    `${GOOGLE_DRIVE_API_BASE_URL}/files/${encodeURIComponent(fileId)}?alt=media`,
  );

  if (typeof rawValue === 'string') {
    return parseSyncData(rawValue);
  }

  return parseSyncData(JSON.stringify(rawValue));
};
