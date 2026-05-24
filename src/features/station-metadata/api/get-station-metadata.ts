import { getStationStreamUrl, type RadioStation } from '@entities/station';
import { getActiveProxies, usePlayerProxyStore, type UserProxy } from '@features/player-proxy';
import type {
  StationMetadataCandidateRequest,
  StationMetadataQueryResult,
  StationMetadataResult,
} from '../model/types';
import { parseStationMetadata } from '../lib/adapters/parse-station-metadata';
import { buildAzuraCastCandidateUrlsFromIcecast } from '../lib/build-azuracast-candidate-urls-from-icecast';
import { buildStationMetadataCandidateRequests } from '../lib/build-station-metadata-candidate-requests';
import { buildStationMetadataCandidateUrls } from '../lib/build-station-metadata-candidate-urls';
import { fetchStationMetadataCandidate } from '../lib/fetch-station-metadata-candidate';
import {
  clearStationMetadataRouteCache,
  getStationMetadataRouteCache,
  setStationMetadataRouteCache,
} from '../model/station-metadata-route-cache';

const mergeStationMetadataResult = (
  currentResult: StationMetadataResult | null,
  nextResult: StationMetadataResult,
): StationMetadataResult => {
  return {
    source: currentResult?.source ?? nextResult.source,
    nowPlaying: currentResult?.nowPlaying ?? nextResult.nowPlaying,
    history: currentResult && currentResult.history.length > 0 ? currentResult.history : nextResult.history,
  };
};

const isStationMetadataComplete = (result: StationMetadataResult): boolean => {
  return Boolean(result.nowPlaying) && result.history.length > 0;
};

const getRequestCacheKey = (request: StationMetadataCandidateRequest): string => {
  return `${request.candidateUrl}:${request.transport.requestUrl}`;
};

const getUniqueRequests = (requests: StationMetadataCandidateRequest[]): StationMetadataCandidateRequest[] => {
  const usedKeys = new Set<string>();

  return requests.filter((request) => {
    const key = getRequestCacheKey(request);

    if (usedKeys.has(key)) {
      return false;
    }

    usedKeys.add(key);
    return true;
  });
};

const getValidCachedRequests = (
  requests: StationMetadataCandidateRequest[],
  proxies: UserProxy[],
): StationMetadataCandidateRequest[] => {
  const activeProxyIds = new Set(getActiveProxies(proxies).map((proxy) => proxy.id));

  return requests.filter((request) => {
    return request.transport.type === 'direct' || activeProxyIds.has(request.transport.proxyId);
  });
};

const getNotFoundResult = (): StationMetadataQueryResult => {
  return {
    status: 'not-found',
    metadata: null,
  };
};

const getTemporaryFailureResult = (): StationMetadataQueryResult => {
  return {
    status: 'temporary-failure',
    metadata: null,
  };
};

const getFoundResult = (metadata: StationMetadataResult): StationMetadataQueryResult => {
  return {
    status: 'found',
    metadata,
  };
};

export const getStationMetadata = async (station: RadioStation): Promise<StationMetadataQueryResult> => {
  const streamUrl = getStationStreamUrl(station);

  if (!streamUrl) {
    return getNotFoundResult();
  }

  let candidateUrls: string[];

  try {
    candidateUrls = buildStationMetadataCandidateUrls(streamUrl);
  } catch {
    return getNotFoundResult();
  }

  const stationId = station.stationuuid;
  const proxies = usePlayerProxyStore.getState().proxies;
  const cachedRequests = getValidCachedRequests(getStationMetadataRouteCache(stationId), proxies);
  const discoveryRequests = buildStationMetadataCandidateRequests(candidateUrls, proxies);
  const queuedCandidateUrls = new Set(candidateUrls);
  const successfulRequests: StationMetadataCandidateRequest[] = [];
  const requests = getUniqueRequests([...cachedRequests, ...discoveryRequests]);

  let metadataResult: StationMetadataResult | null = null;
  let hasTemporaryFailure = false;

  for (const request of requests) {
    const fetchResult = await fetchStationMetadataCandidate(request, streamUrl);

    if (fetchResult.status === 'temporary-failure') {
      hasTemporaryFailure = true;
      continue;
    }

    if (fetchResult.status === 'not-found') {
      continue;
    }

    const input = fetchResult.input;

    const azuraCastCandidateUrls = buildAzuraCastCandidateUrlsFromIcecast(input.body);
    const newAzuraCastCandidateUrls = azuraCastCandidateUrls.filter(
      (candidateUrl) => !queuedCandidateUrls.has(candidateUrl),
    );

    newAzuraCastCandidateUrls.forEach((candidateUrl) => {
      queuedCandidateUrls.add(candidateUrl);
    });

    requests.push(...buildStationMetadataCandidateRequests(newAzuraCastCandidateUrls, proxies));

    const result = parseStationMetadata(input);

    if (!result) {
      continue;
    }

    successfulRequests.push(request);
    metadataResult = mergeStationMetadataResult(metadataResult, result);

    if (isStationMetadataComplete(metadataResult)) {
      setStationMetadataRouteCache(stationId, successfulRequests);
      return getFoundResult(metadataResult);
    }
  }

  if (successfulRequests.length > 0 && metadataResult) {
    setStationMetadataRouteCache(stationId, successfulRequests);
    return getFoundResult(metadataResult);
  }

  clearStationMetadataRouteCache(stationId);

  return hasTemporaryFailure ? getTemporaryFailureResult() : getNotFoundResult();
};
