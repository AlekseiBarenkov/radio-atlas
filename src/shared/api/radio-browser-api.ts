import { DEFAULT_QUERY_RETRY_COUNT } from '../config/query';

export const RADIO_BROWSER_API_BASE_URL = 'https://de1.api.radio-browser.info/json' as const;

export type RadioBrowserRequestTransport =
  | {
      type: 'direct';
      url: string;
    }
  | {
      type: 'proxy';
      url: string;
      proxyId: string;
    };

type RadioBrowserProxyTransport = {
  url: string;
  proxyId: string;
};

type RadioBrowserProxyFallbackConfig = {
  buildTransports: (url: string) => RadioBrowserProxyTransport[];
  onTransportSuccess: (proxyId: string | null) => void;
};

const RADIO_BROWSER_DIRECT_ATTEMPT_LIMIT = DEFAULT_QUERY_RETRY_COUNT + 1;

let directFailureCount = 0;
let isProxyFallbackEnabled = false;

let proxyFallbackConfig: RadioBrowserProxyFallbackConfig | null = null;

export const configureRadioBrowserProxyFallback = (config: RadioBrowserProxyFallbackConfig | null) => {
  proxyFallbackConfig = config;
};

export const notifyRadioBrowserTransportSuccess = (transport: RadioBrowserRequestTransport) => {
  const proxyId = transport.type === 'proxy' ? transport.proxyId : null;
  proxyFallbackConfig?.onTransportSuccess(proxyId);
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

  const proxyTransports = (proxyFallbackConfig?.buildTransports(url) ?? []).map(
    (transport): RadioBrowserRequestTransport => ({
      type: 'proxy',
      url: transport.url,
      proxyId: transport.proxyId,
    }),
  );

  return [directTransport, ...proxyTransports];
};
