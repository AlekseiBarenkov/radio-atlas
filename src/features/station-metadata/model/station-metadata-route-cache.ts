import type { StationMetadataCandidateRequest } from './types';

const stationMetadataRouteCache = new Map<string, StationMetadataCandidateRequest[]>();

export const getStationMetadataRouteCache = (stationId: string): StationMetadataCandidateRequest[] => {
  return stationMetadataRouteCache.get(stationId) ?? [];
};

export const setStationMetadataRouteCache = (stationId: string, requests: StationMetadataCandidateRequest[]): void => {
  stationMetadataRouteCache.set(stationId, requests);
};

export const clearStationMetadataRouteCache = (stationId: string): void => {
  stationMetadataRouteCache.delete(stationId);
};
