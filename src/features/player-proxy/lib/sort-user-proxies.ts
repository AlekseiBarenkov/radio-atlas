import type { UserProxy } from '../model/types';

const getProxyAvailabilityRank = (availability?: boolean): number => {
  if (availability === true) {
    return 0;
  }

  if (availability === undefined) {
    return 1;
  }

  return 2;
};

export const sortUserProxies = (proxies: UserProxy[]): UserProxy[] => {
  return [...proxies].sort((a, b) => {
    const rankDiff = getProxyAvailabilityRank(a.availability) - getProxyAvailabilityRank(b.availability);

    if (rankDiff !== 0) {
      return rankDiff;
    }

    return a.name.localeCompare(b.name);
  });
};
