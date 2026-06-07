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
  connect: async () => {
    await getAccessToken();
  },
  load: async () => {
    return runWithFreshTokenOnAuthError(async (accessToken) => {
      const syncFile = await findGoogleDriveSyncFile(accessToken);

      if (syncFile === null) {
        return null;
      }

      return loadGoogleDriveSyncData(accessToken, syncFile);
    });
  },

  save: async (syncData: SyncData) => {
    return runWithFreshTokenOnAuthError(async (accessToken) => {
      const syncFile = await findGoogleDriveSyncFile(accessToken);

      if (syncFile === null) {
        const createdFile = await createGoogleDriveSyncFile(accessToken, syncData);

        return {
          remoteRevision: createdFile.md5Checksum ?? null,
        };
      }

      const updatedFile = await updateGoogleDriveSyncFile(accessToken, syncFile.id, syncData);

      return {
        remoteRevision: updatedFile.md5Checksum ?? null,
      };
    });
  },
};
