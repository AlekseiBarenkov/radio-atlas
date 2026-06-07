import { useFavoritesStore } from '@features/favorites';
import { usePlayerProxyStore, type UserProxy } from '@features/player-proxy';
import type { SyncData, SyncProxy } from './types';

const applyLocalProxyAvailability = (syncProxies: SyncProxy[]): UserProxy[] => {
  const localProxies = usePlayerProxyStore.getState().proxies;
  const availabilityById = new Map(localProxies.map((proxy) => [proxy.id, proxy.availability]));

  return syncProxies.map((proxy) => {
    const availability = availabilityById.get(proxy.id);

    if (availability === undefined) {
      return proxy;
    }

    return {
      ...proxy,
      availability,
    };
  });
};

export const applySyncData = (syncData: SyncData) => {
  useFavoritesStore.getState().actions.setFavoriteStations(syncData.data.favorites);
  usePlayerProxyStore.getState().actions.setProxies(applyLocalProxyAvailability(syncData.data.proxies));
};
