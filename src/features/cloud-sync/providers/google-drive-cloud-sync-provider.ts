import {
  createGoogleDriveSyncFile,
  findGoogleDriveSyncFile,
  isGoogleDriveAuthError,
  loadGoogleDriveSyncData,
  updateGoogleDriveSyncFile,
} from '../api/google-drive';
import { clearGoogleDriveAccessToken, requestGoogleDriveAccessToken } from '../api/google-identity';
import type { CloudSyncProviderAdapter } from '../model/provider';
import type { SyncData } from '../lib/sync-data';

const getAccessToken = async (): Promise<string> => {
  return requestGoogleDriveAccessToken();
};

const runWithFreshTokenOnAuthError = async <TResult>(operation: (accessToken: string) => Promise<TResult>) => {
  const accessToken = await getAccessToken();

  try {
    return await operation(accessToken);
  } catch (error) {
    if (!isGoogleDriveAuthError(error)) {
      throw error;
    }

    clearGoogleDriveAccessToken();

    const refreshedAccessToken = await getAccessToken();

    return operation(refreshedAccessToken);
  }
};

export const googleDriveCloudSyncProvider: CloudSyncProviderAdapter = {
  load: async () => {
    return runWithFreshTokenOnAuthError(async (accessToken) => {
      const syncFile = await findGoogleDriveSyncFile(accessToken);

      if (syncFile === null) {
        return null;
      }

      return loadGoogleDriveSyncData(accessToken, syncFile.id);
    });
  },

  save: async (syncData: SyncData) => {
    await runWithFreshTokenOnAuthError(async (accessToken) => {
      const syncFile = await findGoogleDriveSyncFile(accessToken);

      if (syncFile === null) {
        await createGoogleDriveSyncFile(accessToken, syncData);
        return;
      }

      await updateGoogleDriveSyncFile(accessToken, syncFile.id, syncData);
    });
  },
};
