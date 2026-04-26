import type { RadioStation } from '@entities/station';

type SearchResultCandidate = {
  station: RadioStation;
  score: number;
  fallbackIndex: number;
};

const SEARCH_RANKING_SCORES = {
  exactMatch: 300,
  startsWithMatch: 200,
  includesMatch: 100,
} as const;

const normalizeSearchText = (value: string): string => {
  return value.trim().toLocaleLowerCase().replaceAll(/[-_]+/g, ' ').replaceAll(/\s+/g, ' ');
};

const getSearchMatchScore = (stationName: string, normalizedSearch: string): number => {
  const normalizedStationName = normalizeSearchText(stationName);

  if (normalizedStationName === normalizedSearch) {
    return SEARCH_RANKING_SCORES.exactMatch;
  }

  if (normalizedStationName.startsWith(normalizedSearch)) {
    return SEARCH_RANKING_SCORES.startsWithMatch;
  }

  if (normalizedStationName.includes(normalizedSearch)) {
    return SEARCH_RANKING_SCORES.includesMatch;
  }

  return 0;
};

export const rankSearchResults = (stations: RadioStation[], search: string): RadioStation[] => {
  const normalizedSearch = normalizeSearchText(search);

  if (normalizedSearch.length === 0) {
    return stations;
  }

  const candidates: SearchResultCandidate[] = stations.map((station, index) => ({
    station,
    score: getSearchMatchScore(station.name, normalizedSearch),
    fallbackIndex: index,
  }));

  return candidates
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (right.station.clickcount !== left.station.clickcount) {
        return right.station.clickcount - left.station.clickcount;
      }

      if (right.station.votes !== left.station.votes) {
        return right.station.votes - left.station.votes;
      }

      return left.fallbackIndex - right.fallbackIndex;
    })
    .map((candidate) => candidate.station);
};
