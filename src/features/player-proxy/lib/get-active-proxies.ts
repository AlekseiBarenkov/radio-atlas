import { sortUserProxies } from './sort-user-proxies';
import type { UserProxy } from '../model/types';

export const getActiveProxies = (proxies: UserProxy[]): UserProxy[] => {
  return sortUserProxies(proxies.filter((proxy) => proxy.enabled));
};
