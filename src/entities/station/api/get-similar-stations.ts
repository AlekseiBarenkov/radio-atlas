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

type SimilarStationsStrategy =
  | {
      type: 'tag';
      value: string;
      score: number;
    }
  | {
      type: 'search';
      params: Omit<SearchStationsParams, 'limit'>;
      score: number;
    };

type SimilarStationCandidate = {
  station: RadioStation;
  score: number;
};

const DEFAULT_LIMIT = 6;
const MAX_TAGS_TO_FETCH = 3;
const SEARCH_LIMIT_MULTIPLIER = 2;

const STRATEGY_SCORES = {
  tag: 100,
  countryLanguage: 60,
  countryState: 40,
  country: 20,
  language: 10,
} as const;

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

const getSearchStrategyKey = (params: Omit<SearchStationsParams, 'limit'>): string => {
  return JSON.stringify({
    country: params.country ?? '',
    state: params.state ?? '',
    language: params.language ?? '',
    tag: params.tag ?? '',
  });
};

const getSimilarStationsStrategies = (station: RadioStation): SimilarStationsStrategy[] => {
  const country = normalizeText(station.country);
  const state = normalizeText(station.state);
  const primaryLanguage = getNormalizedList(station.language)[0] ?? '';
  const tags = getNormalizedList(station.tags).slice(0, MAX_TAGS_TO_FETCH);

  const strategies: SimilarStationsStrategy[] = tags.map((tag) => ({
    type: 'tag',
    value: tag,
    score: STRATEGY_SCORES.tag,
  }));

  if (country.length > 0 && primaryLanguage.length > 0) {
    strategies.push({
      type: 'search',
      params: {
        country,
        language: primaryLanguage,
      },
      score: STRATEGY_SCORES.countryLanguage,
    });
  }

  if (country.length > 0 && state.length > 0) {
    strategies.push({
      type: 'search',
      params: {
        country,
        state,
      },
      score: STRATEGY_SCORES.countryState,
    });
  }

  if (country.length > 0) {
    strategies.push({
      type: 'search',
      params: {
        country,
      },
      score: STRATEGY_SCORES.country,
    });
  }

  if (primaryLanguage.length > 0) {
    strategies.push({
      type: 'search',
      params: {
        language: primaryLanguage,
      },
      score: STRATEGY_SCORES.language,
    });
  }

  const seenSearchKeys = new Set<string>();

  return strategies.filter((strategy) => {
    if (strategy.type === 'tag') {
      return true;
    }

    const strategyKey = getSearchStrategyKey(strategy.params);

    if (seenSearchKeys.has(strategyKey)) {
      return false;
    }

    seenSearchKeys.add(strategyKey);

    return true;
  });
};

const appendCandidateStations = (
  candidateMap: Map<string, SimilarStationCandidate>,
  stations: RadioStation[],
  excludedStationId: string,
  strategyScore: number,
) => {
  stations.forEach((station) => {
    if (station.stationuuid === excludedStationId) {
      return;
    }

    const existingCandidate = candidateMap.get(station.stationuuid);

    if (!existingCandidate) {
      candidateMap.set(station.stationuuid, {
        station,
        score: strategyScore,
      });

      return;
    }

    candidateMap.set(station.stationuuid, {
      station: existingCandidate.station,
      score: existingCandidate.score + strategyScore,
    });
  });
};

const sortCandidates = (candidates: SimilarStationCandidate[]): SimilarStationCandidate[] => {
  return [...candidates].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    if (right.station.clickcount !== left.station.clickcount) {
      return right.station.clickcount - left.station.clickcount;
    }

    if (right.station.votes !== left.station.votes) {
      return right.station.votes - left.station.votes;
    }

    return left.station.name.localeCompare(right.station.name);
  });
};

const hasEnoughCandidates = (candidateMap: Map<string, SimilarStationCandidate>, limit: number): boolean => {
  return candidateMap.size >= limit;
};

export const getSimilarStations = async (
  params: GetSimilarStationsParams,
  signal?: AbortSignal,
): Promise<RadioStation[]> => {
  const { station, limit = DEFAULT_LIMIT } = params;

  const stationId = normalizeText(station.stationuuid);

  if (stationId.length === 0) {
    return [];
  }

  const requestLimit = getRequestLimit(limit);
  const candidateMap = new Map<string, SimilarStationCandidate>();
  const strategies = getSimilarStationsStrategies(station);

  for (const strategy of strategies) {
    if (hasEnoughCandidates(candidateMap, limit)) {
      break;
    }

    const stations =
      strategy.type === 'tag'
        ? await getStationsByTag(strategy.value, requestLimit, signal)
        : await searchStations(
            {
              ...strategy.params,
              limit: requestLimit,
            },
            signal,
          );

    appendCandidateStations(candidateMap, stations, stationId, strategy.score);
  }

  return sortCandidates(Array.from(candidateMap.values()))
    .slice(0, limit)
    .map((candidate) => candidate.station);
};
