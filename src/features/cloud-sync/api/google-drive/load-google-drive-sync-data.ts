import { GOOGLE_DRIVE_API_BASE_URL, type GoogleDriveFile } from './types';
import { googleDriveRequest } from './google-drive-request';
import type { SyncRemoteBackup } from '../../lib/sync-data';
import { parseSyncData } from '../../lib/sync-data';

export const loadGoogleDriveSyncData = async (
  accessToken: string,
  syncFile: GoogleDriveFile,
): Promise<SyncRemoteBackup> => {
  const rawValue = await googleDriveRequest<unknown>(
    accessToken,
    `${GOOGLE_DRIVE_API_BASE_URL}/files/${encodeURIComponent(syncFile.id)}?alt=media`,
  );

  const syncData = typeof rawValue === 'string' ? parseSyncData(rawValue) : parseSyncData(JSON.stringify(rawValue));

  if (syncData === null) {
    throw new Error('Invalid Google Drive sync data');
  }

  return {
    syncData,
    remoteRevision: syncFile.md5Checksum ?? null,
  };
};
