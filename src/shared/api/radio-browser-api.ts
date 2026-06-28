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
  getProxyFirst: () => boolean;
  onTransportSuccess: (proxyId: string | null) => void;
};

let proxyFallbackConfig: RadioBrowserProxyFallbackConfig | null = null;

export const configureRadioBrowserProxyFallback = (config: RadioBrowserProxyFallbackConfig | null) => {
  proxyFallbackConfig = config;
};

export const notifyRadioBrowserTransportSuccess = (transport: RadioBrowserRequestTransport) => {
  const proxyId = transport.type === 'proxy' ? transport.proxyId : null;
  proxyFallbackConfig?.onTransportSuccess(proxyId);
};

export const getRadioBrowserRequestTransports = (url: string): RadioBrowserRequestTransport[] => {
  const directTransport: RadioBrowserRequestTransport = {
    type: 'direct',
    url,
  };

  if (!proxyFallbackConfig?.getProxyFirst()) {
    return [directTransport];
  }

  const proxyTransports = proxyFallbackConfig.buildTransports(url).map(
    (transport): RadioBrowserRequestTransport => ({
      type: 'proxy',
      url: transport.url,
      proxyId: transport.proxyId,
    }),
  );

  return [...proxyTransports, directTransport];
};
