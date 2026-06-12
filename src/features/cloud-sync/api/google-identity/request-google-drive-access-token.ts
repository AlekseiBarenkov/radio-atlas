import type { GoogleIdentityGlobal, GoogleTokenResponse } from './types';
import { loadGoogleIdentityScript } from './load-google-identity-script';
import { CloudSyncCancelledError, CloudSyncError } from '../../model/cloud-sync-error';
import { CLOUD_SYNC_ERROR_CODES } from '../../model/types';

const GOOGLE_DRIVE_APP_DATA_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const GOOGLE_ACCESS_TOKEN_TTL_MS = 50 * 60 * 1000;
const GOOGLE_ACCESS_TOKEN_STORAGE_KEY = 'radio-atlas:google-drive-token';
const GOOGLE_OAUTH_TIMEOUT_MS = 2 * 60 * 1000;

type StoredGoogleAccessToken = {
  accessToken: string;
  expiresAt: number;
};

const isStoredGoogleAccessToken = (value: unknown): value is StoredGoogleAccessToken => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<StoredGoogleAccessToken>;

  return typeof candidate.accessToken === 'string' && typeof candidate.expiresAt === 'number';
};

export const clearGoogleDriveAccessToken = () => {
  localStorage.removeItem(GOOGLE_ACCESS_TOKEN_STORAGE_KEY);
};

const readStoredAccessToken = (): StoredGoogleAccessToken | null => {
  const rawToken = localStorage.getItem(GOOGLE_ACCESS_TOKEN_STORAGE_KEY);

  if (rawToken === null) {
    return null;
  }

  try {
    const parsedToken: unknown = JSON.parse(rawToken);

    if (!isStoredGoogleAccessToken(parsedToken)) {
      clearGoogleDriveAccessToken();
      return null;
    }

    return parsedToken;
  } catch {
    clearGoogleDriveAccessToken();
    return null;
  }
};

const getCachedAccessToken = (): string | null => {
  const storedToken = readStoredAccessToken();

  if (storedToken === null) {
    return null;
  }

  if (Date.now() >= storedToken.expiresAt) {
    clearGoogleDriveAccessToken();
    return null;
  }

  return storedToken.accessToken;
};

const setCachedAccessToken = (accessToken: string) => {
  const expiresAt = Date.now() + GOOGLE_ACCESS_TOKEN_TTL_MS;

  localStorage.setItem(
    GOOGLE_ACCESS_TOKEN_STORAGE_KEY,
    JSON.stringify({
      accessToken,
      expiresAt,
    } satisfies StoredGoogleAccessToken),
  );
};

const getGoogleIdentity = (): GoogleIdentityGlobal | null => {
  const candidate = (window as Window & { google?: unknown }).google;

  if (typeof candidate !== 'object' || candidate === null) {
    return null;
  }

  return candidate as GoogleIdentityGlobal;
};

export const requestGoogleDriveAccessToken = async (): Promise<string> => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new CloudSyncError(CLOUD_SYNC_ERROR_CODES.GOOGLE_CLIENT_ID_MISSING);
  }

  const cachedToken = getCachedAccessToken();

  if (cachedToken !== null) {
    return cachedToken;
  }

  try {
    await loadGoogleIdentityScript();
  } catch {
    throw new CloudSyncError(CLOUD_SYNC_ERROR_CODES.GOOGLE_AUTH_FAILED);
  }

  const googleIdentity = getGoogleIdentity();

  if (googleIdentity === null) {
    throw new CloudSyncError(CLOUD_SYNC_ERROR_CODES.GOOGLE_AUTH_FAILED);
  }

  return new Promise((resolve, reject) => {
    let timeoutId: number | null = null;

    const cleanup = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };

    const rejectAuth = () => {
      cleanup();
      reject(new CloudSyncError(CLOUD_SYNC_ERROR_CODES.GOOGLE_AUTH_FAILED));
    };

    const rejectCancelled = () => {
      cleanup();
      reject(new CloudSyncCancelledError());
    };

    timeoutId = window.setTimeout(rejectCancelled, GOOGLE_OAUTH_TIMEOUT_MS);

    const tokenClient = googleIdentity.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_DRIVE_APP_DATA_SCOPE,
      callback: (response: GoogleTokenResponse) => {
        if (response.error) {
          rejectAuth();
          return;
        }

        if (!response.access_token) {
          rejectAuth();
          return;
        }

        cleanup();
        setCachedAccessToken(response.access_token);
        resolve(response.access_token);
      },
      error_callback: (error) => {
        if (error.type === 'popup_closed') {
          rejectCancelled();
          return;
        }

        rejectAuth();
      },
    });

    tokenClient.requestAccessToken();
  });
};
