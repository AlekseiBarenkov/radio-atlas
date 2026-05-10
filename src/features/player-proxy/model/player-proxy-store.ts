import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MAX_PROXY_PRIORITY, MIN_PROXY_PRIORITY, PLAYER_PROXY_STORAGE_KEY } from './constants';
import type { PlayerProxyStore, UserProxy, UserProxyInput } from './types';

const clampProxyPriority = (priority: number): number => {
  return Math.min(MAX_PROXY_PRIORITY, Math.max(MIN_PROXY_PRIORITY, priority));
};

const createUserProxy = (input: UserProxyInput): UserProxy => {
  return {
    ...input,
    id: crypto.randomUUID(),
    priority: MIN_PROXY_PRIORITY,
    successCount: 0,
    failureCount: 0,
    lastSuccessAt: null,
    lastFailureAt: null,
  };
};

export const usePlayerProxyStore = create<PlayerProxyStore>()(
  persist(
    (set) => ({
      proxies: [],
      activeProxyId: null,

      actions: {
        addProxy: (input) => {
          set((state) => ({
            proxies: [...state.proxies, createUserProxy(input)],
          }));
        },

        updateProxy: (proxyId, input) => {
          set((state) => ({
            proxies: state.proxies.map((proxy) => (proxy.id === proxyId ? { ...proxy, ...input } : proxy)),
          }));
        },

        removeProxy: (proxyId) => {
          set((state) => ({
            proxies: state.proxies.filter((proxy) => proxy.id !== proxyId),
            activeProxyId: state.activeProxyId === proxyId ? null : state.activeProxyId,
          }));
        },

        markProxySuccess: (proxyId) => {
          set((state) => ({
            proxies: state.proxies.map((proxy) =>
              proxy.id === proxyId
                ? {
                    ...proxy,
                    priority: clampProxyPriority(proxy.priority + 1),
                    successCount: proxy.successCount + 1,
                    lastSuccessAt: new Date().toISOString(),
                  }
                : proxy,
            ),
          }));
        },

        markProxyFailure: (proxyId) => {
          set((state) => ({
            proxies: state.proxies.map((proxy) =>
              proxy.id === proxyId
                ? {
                    ...proxy,
                    priority: clampProxyPriority(proxy.priority - 1),
                    failureCount: proxy.failureCount + 1,
                    lastFailureAt: new Date().toISOString(),
                  }
                : proxy,
            ),
          }));
        },
        toggleProxyEnabled: (proxyId) => {
          set((state) => ({
            proxies: state.proxies.map((proxy) =>
              proxy.id === proxyId ? { ...proxy, enabled: !proxy.enabled } : proxy,
            ),
          }));
        },
        setActiveProxyId: (proxyId) => {
          set({
            activeProxyId: proxyId,
          });
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
