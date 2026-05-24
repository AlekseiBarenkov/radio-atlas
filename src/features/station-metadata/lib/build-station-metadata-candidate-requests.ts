import { buildProxyStreamUrl, getActiveProxies, type UserProxy } from '@features/player-proxy';
import type { StationMetadataCandidateRequest, StationMetadataTransport } from '../model/types';

const buildTransports = (candidateUrl: string, proxies: UserProxy[]): StationMetadataTransport[] => {
  return [
    {
      type: 'direct',
      requestUrl: candidateUrl,
    },
    ...proxies.map((proxy) => ({
      type: 'proxy' as const,
      proxyId: proxy.id,
      proxyName: proxy.name,
      requestUrl: buildProxyStreamUrl(proxy, candidateUrl),
    })),
  ];
};

export const buildStationMetadataCandidateRequests = (
  candidateUrls: string[],
  proxies: UserProxy[],
): StationMetadataCandidateRequest[] => {
  const activeProxies = getActiveProxies(proxies);

  return candidateUrls.flatMap((candidateUrl) => {
    return buildTransports(candidateUrl, activeProxies).map((transport) => ({
      candidateUrl,
      transport,
    }));
  });
};
