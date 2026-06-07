import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PLAYER_PROXY_STORAGE_KEY } from './constants';
import type { PlayerProxyStore } from './types';
import { checkUserProxy } from '../lib/check-user-proxy';
import { notifySyncDataChanged } from '@/shared/lib/sync-data-events';

export const usePlayerProxyStore = create<PlayerProxyStore>()(
  persist(
    (set, get) => ({
      proxies: [],
      activeProxyId: null,

      actions: {
        addProxy: (input) => {
          const next = {
            ...input,
            id: crypto.randomUUID(),
          };

          set((state) => ({
            proxies: [...state.proxies, next],
          }));

          notifySyncDataChanged();
        },

        setProxies: (proxies) => {
          set({
            proxies,
          });
        },

        updateProxy: (proxyId, input) => {
          set((state) => ({
            proxies: state.proxies.map((proxy) =>
              proxy.id === proxyId ? { ...proxy, ...input, availability: undefined } : proxy,
            ),
          }));

          notifySyncDataChanged();
        },

        removeProxy: (proxyId) => {
          set((state) => ({
            proxies: state.proxies.filter((proxy) => proxy.id !== proxyId),
            activeProxyId: state.activeProxyId === proxyId ? null : state.activeProxyId,
          }));

          notifySyncDataChanged();
        },

        toggleProxyEnabled: (proxyId) => {
          set((state) => ({
            proxies: state.proxies.map((proxy) =>
              proxy.id === proxyId ? { ...proxy, enabled: !proxy.enabled } : proxy,
            ),
          }));

          notifySyncDataChanged();
        },
        setActiveProxyId: (proxyId) => {
          set({
            activeProxyId: proxyId,
          });
        },

        setProxyAvailability: (proxyId, availability) => {
          set((state) => ({
            proxies: state.proxies.map((proxy) => (proxy.id === proxyId ? { ...proxy, availability } : proxy)),
          }));
        },

        checkProxy: async (proxyId) => {
          const proxy = get().proxies.find((item) => item.id === proxyId);

          if (!proxy) {
            return;
          }

          const isAvailable = await checkUserProxy(proxy);

          get().actions.setProxyAvailability(proxyId, isAvailable);
        },
      },
    }),
    {
      name: PLAYER_PROXY_STORAGE_KEY,
      partialize: (state) => ({
        proxies: state.proxies,
      }),
    },
  ),
);
