import type { Language } from '@/features/localization';
import { CloudSyncError } from '../../model/cloud-sync-error';
import { CLOUD_SYNC_ERROR_CODES } from '../../model/types';

const YANDEX_DISK_APP_FOLDER_SCOPE = 'cloud_api:disk.app_folder';
const YANDEX_OAUTH_AUTHORIZE_URL_BY_LANGUAGE: Record<Language, string> = {
  ru: 'https://oauth.yandex.ru/authorize',
  en: 'https://oauth.yandex.com/authorize',
};
const YANDEX_ACCESS_TOKEN_STORAGE_KEY = 'radio-atlas:yandex-disk-token';
const YANDEX_OAUTH_POPUP_TIMEOUT_MS = 2 * 60 * 1000;
const YANDEX_OAUTH_POPUP_POLL_MS = 300;

type StoredYandexAccessToken = {
  accessToken: string;
  expiresAt: number;
};

type YandexOAuthToken = {
  accessToken: string;
  expiresIn: number;
};

type ParsedYandexOAuthHash =
  | {
      type: 'success';
      accessToken: string;
      expiresIn: number;
    }
  | {
      type: 'error';
    };

const isStoredYandexAccessToken = (value: unknown): value is StoredYandexAccessToken => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<StoredYandexAccessToken>;

  return typeof candidate.accessToken === 'string' && typeof candidate.expiresAt === 'number';
};

export const clearYandexDiskAccessToken = () => {
  localStorage.removeItem(YANDEX_ACCESS_TOKEN_STORAGE_KEY);
};

const getCachedAccessToken = (): string | null => {
  const rawToken = localStorage.getItem(YANDEX_ACCESS_TOKEN_STORAGE_KEY);

  if (rawToken === null) {
    return null;
  }

  try {
    const parsedToken: unknown = JSON.parse(rawToken);

    if (!isStoredYandexAccessToken(parsedToken)) {
      clearYandexDiskAccessToken();
      return null;
    }

    if (Date.now() >= parsedToken.expiresAt) {
      clearYandexDiskAccessToken();
      return null;
    }

    return parsedToken.accessToken;
  } catch {
    clearYandexDiskAccessToken();
    return null;
  }
};

const setCachedAccessToken = (token: YandexOAuthToken) => {
  localStorage.setItem(
    YANDEX_ACCESS_TOKEN_STORAGE_KEY,
    JSON.stringify({
      accessToken: token.accessToken,
      expiresAt: Date.now() + token.expiresIn * 1000,
    } satisfies StoredYandexAccessToken),
  );
};

const parseYandexOAuthHash = (hash: string, expectedState: string): ParsedYandexOAuthHash | null => {
  if (!hash) {
    return null;
  }

  const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);

  if (params.get('error') !== null) {
    return { type: 'error' };
  }

  if (params.get('state') !== expectedState) {
    return { type: 'error' };
  }

  const accessToken = params.get('access_token');
  const expiresInValue = params.get('expires_in');

  if (accessToken === null || expiresInValue === null) {
    return { type: 'error' };
  }

  const expiresIn = Number(expiresInValue);

  if (!Number.isFinite(expiresIn) || expiresIn <= 0) {
    return { type: 'error' };
  }

  return {
    type: 'success',
    accessToken,
    expiresIn,
  };
};

const isPopupClosed = (popup: Window): boolean => {
  try {
    return popup.closed;
  } catch {
    return true;
  }
};

const requestYandexOAuthToken = (language: Language): Promise<YandexOAuthToken> => {
  const clientId = import.meta.env.VITE_YANDEX_CLIENT_ID;

  if (!clientId) {
    throw new CloudSyncError(CLOUD_SYNC_ERROR_CODES.YANDEX_CLIENT_ID_MISSING);
  }

  const state = crypto.randomUUID();
  const redirectUri = `${window.location.origin}${window.location.pathname}`;

  const searchParams = new URLSearchParams({
    response_type: 'token',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: YANDEX_DISK_APP_FOLDER_SCOPE,
    state,
  });

  const popup = window.open(
    `${YANDEX_OAUTH_AUTHORIZE_URL_BY_LANGUAGE[language]}?${searchParams.toString()}`,
    'radio-atlas-yandex-oauth',
    'popup=yes,width=520,height=720',
  );

  if (popup === null) {
    throw new CloudSyncError(CLOUD_SYNC_ERROR_CODES.YANDEX_AUTH_FAILED);
  }

  popup.focus();

  return new Promise((resolve, reject) => {
    let intervalId: number | null = null;
    let timeoutId: number | null = null;

    const cleanup = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      if (!isPopupClosed(popup)) {
        popup.close();
      }
    };

    const rejectAuth = () => {
      cleanup();
      reject(new CloudSyncError(CLOUD_SYNC_ERROR_CODES.YANDEX_AUTH_FAILED));
    };

    timeoutId = window.setTimeout(rejectAuth, YANDEX_OAUTH_POPUP_TIMEOUT_MS);

    intervalId = window.setInterval(() => {
      if (isPopupClosed(popup)) {
        rejectAuth();
        return;
      }

      try {
        const result = parseYandexOAuthHash(popup.location.hash, state);

        if (result === null) {
          return;
        }

        if (result.type === 'error') {
          rejectAuth();
          return;
        }

        cleanup();
        resolve({
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
        });
      } catch {
        // Popup is still on the Yandex origin.
      }
    }, YANDEX_OAUTH_POPUP_POLL_MS);
  });
};

export const requestYandexDiskAccessToken = async (language: Language): Promise<string> => {
  const cachedToken = getCachedAccessToken();

  if (cachedToken !== null) {
    return cachedToken;
  }

  const token = await requestYandexOAuthToken(language);

  setCachedAccessToken(token);

  return token.accessToken;
};
