import { configureRadioBrowserProxyFallback } from '@shared/api/radio-browser-api';
import { buildProxyStreamUrl } from './build-proxy-stream-url';
import { getActiveProxies } from './get-active-proxies';
import { usePlayerProxyStore } from '../model/player-proxy-store';

configureRadioBrowserProxyFallback({
  buildTransports: (url) => {
    const proxies = getActiveProxies(usePlayerProxyStore.getState().proxies);

    return proxies.map((proxy) => ({
      proxyId: proxy.id,
      url: buildProxyStreamUrl(proxy, url),
    }));
  },
  onTransportSuccess: (proxyId) => {
    const actions = usePlayerProxyStore.getState().actions;

    actions.setRadioBrowserProxyId(proxyId);

    if (proxyId !== null) {
      actions.setProxyAvailability(proxyId, true);
    }
  },
  getProxyFirst: () => {
    return usePlayerProxyStore.getState().proxyRadioBrowserRequests;
  },
});
