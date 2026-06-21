export const RADIO_BROWSER_API_BASE_URL = 'https://de1.api.radio-browser.info/json' as const;

export type RadioBrowserRequestTransport = {
  type: 'direct' | 'proxy';
  url: string;
};

type RadioBrowserProxyFallbackBuilder = (url: string) => string[];

const DIRECT_FAILURE_CACHE_MS = 5 * 60 * 1000;

let proxyFallbackBuilder: RadioBrowserProxyFallbackBuilder | null = null;
let preferProxyUntil = 0;

export const configureRadioBrowserProxyFallback = (builder: RadioBrowserProxyFallbackBuilder | null) => {
  proxyFallbackBuilder = builder;
};

export const markRadioBrowserDirectFailure = () => {
  preferProxyUntil = Date.now() + DIRECT_FAILURE_CACHE_MS;
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

  if (proxyTransports.length === 0) {
    return [directTransport];
  }

  return Date.now() < preferProxyUntil ? [...proxyTransports, directTransport] : [directTransport, ...proxyTransports];
};
