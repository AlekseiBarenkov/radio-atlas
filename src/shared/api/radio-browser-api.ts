import { DEFAULT_QUERY_RETRY_COUNT } from '../config/query';

export const RADIO_BROWSER_API_BASE_URL = 'https://de1.api.radio-browser.info/json' as const;

export type RadioBrowserRequestTransport = {
  type: 'direct' | 'proxy';
  url: string;
};

type RadioBrowserProxyFallbackBuilder = (url: string) => string[];

const RADIO_BROWSER_DIRECT_ATTEMPT_LIMIT = DEFAULT_QUERY_RETRY_COUNT + 1;

let proxyFallbackBuilder: RadioBrowserProxyFallbackBuilder | null = null;
let directFailureCount = 0;
let isProxyFallbackEnabled = false;

export const configureRadioBrowserProxyFallback = (builder: RadioBrowserProxyFallbackBuilder | null) => {
  proxyFallbackBuilder = builder;
};

export const getIsRadioBrowserProxyFallbackEnabled = (): boolean => {
  return isProxyFallbackEnabled;
};

export const markRadioBrowserDirectFailure = () => {
  directFailureCount += 1;

  if (directFailureCount >= RADIO_BROWSER_DIRECT_ATTEMPT_LIMIT) {
    isProxyFallbackEnabled = true;
  }
};

export const resetRadioBrowserDirectFailures = () => {
  directFailureCount = 0;
  isProxyFallbackEnabled = false;
};

export const getRadioBrowserRequestTransports = (url: string): RadioBrowserRequestTransport[] => {
  const directTransport: RadioBrowserRequestTransport = {
    type: 'direct',
    url,
  };

  const proxyTransports = (proxyFallbackBuilder?.(url) ?? []).map(
    (proxyUrl): RadioBrowserRequestTransport => ({
      type: 'proxy',
      url: proxyUrl,
    }),
  );

  return [directTransport, ...proxyTransports];
};
