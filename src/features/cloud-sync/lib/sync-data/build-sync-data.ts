import { useFavoritesStore } from '@features/favorites';
import { usePlayerProxyStore, type UserProxy } from '@features/player-proxy';
import type { SyncData, SyncProxy } from './types';

const mapProxyToSyncProxy = (proxy: UserProxy): SyncProxy => ({
  id: proxy.id,
  name: proxy.name,
  host: proxy.host,
  port: proxy.port,
  token: proxy.token,
  enabled: proxy.enabled,
});

export const buildSyncData = (updatedAt = new Date().toISOString()): SyncData => {
  const favorites = useFavoritesStore.getState().favoriteStations;
  const proxies = usePlayerProxyStore.getState().proxies.map(mapProxyToSyncProxy);

  return {
    version: 1,
    updatedAt,
    app: 'radio-atlas',
    data: {
      favorites,
      proxies,
    },
  };
};
