import { configureRadioBrowserProxyFallback } from '@shared/api/radio-browser-api';
import { buildProxyStreamUrl } from './build-proxy-stream-url';
import { getActiveProxies } from './get-active-proxies';
import { usePlayerProxyStore } from '../model/player-proxy-store';

configureRadioBrowserProxyFallback((url) => {
  const proxies = getActiveProxies(usePlayerProxyStore.getState().proxies);

  return proxies.map((proxy) => buildProxyStreamUrl(proxy, url));
});
