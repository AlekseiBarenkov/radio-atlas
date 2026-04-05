import { RADIO_BROWSER_API_BASE_URL } from '@shared/api/radio-browser-api';
import { request } from '@shared/api/request';
import type { RadioStation } from '../model/types';

type GetSimilarStationsParams = {
  station: RadioStation;
  limit?: number;
};

type SearchStationsParams = {
  tag?: string;
  country?: string;
  state?: string;
  language?: string;
  limit: number;
};

const DEFAULT_LIMIT = 6;
const MAX_TAGS_TO_FETCH = 3;
const SEARCH_LIMIT_MULTIPLIER = 2;

const normalizeText = (value: string): string => {
  return value.trim();
};

const getNormalizedList = (value: string): string[] => {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item, index, array) => item.length > 0 && array.indexOf(item) === index);
};

const getRequestLimit = (limit: number): number => {
  return Math.max(limit * SEARCH_LIMIT_MULTIPLIER, limit + 1);
};

const getStationsByTag = async (tag: string, limit: number, signal?: AbortSignal): Promise<RadioStation[]> => {
  const searchParams = new URLSearchParams({
    limit: String(limit),
    hidebroken: 'true',
  });

  return request<RadioStation[]>(
    `${RADIO_BROWSER_API_BASE_URL}/stations/bytag/${encodeURIComponent(tag)}?${searchParams.toString()}`,
    {
      signal,
    },
  );
};

const searchStations = async (params: SearchStationsParams, signal?: AbortSignal): Promise<RadioStation[]> => {
  const searchParams = new URLSearchParams({
    limit: String(params.limit),
    hidebroken: 'true',
  });

  if (params.tag) {
    searchParams.set('tag', params.tag);
  }

  if (params.country) {
    searchParams.set('country', params.country);
    searchParams.set('countryExact', 'true');
  }

  if (params.state) {
    searchParams.set('state', params.state);
    searchParams.set('stateExact', 'true');
  }

  if (params.language) {
    searchParams.set('language', params.language);
  }

  return request<RadioStation[]>(`${RADIO_BROWSER_API_BASE_URL}/stations/search?${searchParams.toString()}`, {
    signal,
  });
};

const appendUniqueStations = (
  stationMap: Map<string, RadioStation>,
  stations: RadioStation[],
  excludedStationId: string,
  limit: number,
) => {
  stations.forEach((station) => {
    if (station.stationuuid === excludedStationId) {
      return;
    }

    if (stationMap.has(station.stationuuid)) {
      return;
    }

    stationMap.set(station.stationuuid, station);
  });

  return stationMap.size >= limit;
};

export const getSimilarStations = async (
  params: GetSimilarStationsParams,
  signal?: AbortSignal,
): Promise<RadioStation[]> => {
  const { station, limit = DEFAULT_LIMIT } = params;

  const stationId = normalizeText(station.stationuuid);
  const country = normalizeText(station.country);
  const state = normalizeText(station.state);
  const primaryLanguage = getNormalizedList(station.language)[0] ?? '';
  const tags = getNormalizedList(station.tags).slice(0, MAX_TAGS_TO_FETCH);

  if (stationId.length === 0) {
    return [];
  }

  const requestLimit = getRequestLimit(limit);
  const stationMap = new Map<string, RadioStation>();

  for (const tag of tags) {
    const stations = await getStationsByTag(tag, requestLimit, signal);

    if (appendUniqueStations(stationMap, stations, stationId, limit)) {
      return Array.from(stationMap.values()).slice(0, limit);
    }
  }

  if (country.length > 0 && primaryLanguage.length > 0) {
    const stations = await searchStations(
      {
        country,
        language: primaryLanguage,
        limit: requestLimit,
      },
      signal,
    );

    if (appendUniqueStations(stationMap, stations, stationId, limit)) {
      return Array.from(stationMap.values()).slice(0, limit);
    }
  }

  if (country.length > 0 && state.length > 0) {
    const stations = await searchStations(
      {
        country,
        state,
        limit: requestLimit,
      },
      signal,
    );

    if (appendUniqueStations(stationMap, stations, stationId, limit)) {
      return Array.from(stationMap.values()).slice(0, limit);
    }
  }

  if (country.length > 0) {
    const stations = await searchStations(
      {
        country,
        limit: requestLimit,
      },
      signal,
    );

    if (appendUniqueStations(stationMap, stations, stationId, limit)) {
      return Array.from(stationMap.values()).slice(0, limit);
    }
  }

  if (primaryLanguage.length > 0) {
    const stations = await searchStations(
      {
        language: primaryLanguage,
        limit: requestLimit,
      },
      signal,
    );

    appendUniqueStations(stationMap, stations, stationId, limit);
  }

  return Array.from(stationMap.values()).slice(0, limit);
};
