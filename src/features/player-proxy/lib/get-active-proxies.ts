import type { UserProxy } from '../model/types';

export const getActiveProxies = (proxies: UserProxy[]): UserProxy[] => {
  return [...proxies].filter((proxy) => proxy.enabled).sort((a, b) => b.priority - a.priority);
};
