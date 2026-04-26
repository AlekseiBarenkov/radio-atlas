import type { RadioStation } from '../model/types';

export type SimilarStationCandidate = {
  station: RadioStation;
  score: number;
  fallbackIndex: number;
};

type RankSimilarStationsParams = {
  candidates: SimilarStationCandidate[];
  currentStation: RadioStation;
};

const normalizeText = (value: string): string => {
  return value.trim().toLocaleLowerCase();
};

const getNormalizedList = (value: string): string[] => {
  return value
    .split(',')
    .map(normalizeText)
    .filter((item, index, array) => item.length > 0 && array.indexOf(item) === index);
};

const hasIntersection = (left: string[], right: string[]): boolean => {
  return left.some((item) => right.includes(item));
};

const RANKING_SCORES = {
  tagMatch: 50,
  languageMatch: 30,
  countryMatch: 20,
  stateMatch: 10,
} as const;

const getSimilarityScore = (station: RadioStation, currentStation: RadioStation): number => {
  const stationTags = getNormalizedList(station.tags);
  const currentStationTags = getNormalizedList(currentStation.tags);

  const stationLanguages = getNormalizedList(station.language);
  const currentStationLanguages = getNormalizedList(currentStation.language);

  const stationCountry = normalizeText(station.country);
  const currentStationCountry = normalizeText(currentStation.country);

  const stationState = normalizeText(station.state);
  const currentStationState = normalizeText(currentStation.state);

  return (
    (hasIntersection(stationTags, currentStationTags) ? RANKING_SCORES.tagMatch : 0) +
    (hasIntersection(stationLanguages, currentStationLanguages) ? RANKING_SCORES.languageMatch : 0) +
    (stationCountry.length > 0 && stationCountry === currentStationCountry ? RANKING_SCORES.countryMatch : 0) +
    (stationState.length > 0 && stationState === currentStationState ? RANKING_SCORES.stateMatch : 0)
  );
};

export const rankSimilarStations = (params: RankSimilarStationsParams): SimilarStationCandidate[] => {
  const { candidates, currentStation } = params;

  return [...candidates].sort((left, right) => {
    const leftScore = left.score + getSimilarityScore(left.station, currentStation);
    const rightScore = right.score + getSimilarityScore(right.station, currentStation);

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    if (right.station.clickcount !== left.station.clickcount) {
      return right.station.clickcount - left.station.clickcount;
    }

    if (right.station.votes !== left.station.votes) {
      return right.station.votes - left.station.votes;
    }

    if (left.fallbackIndex !== right.fallbackIndex) {
      return left.fallbackIndex - right.fallbackIndex;
    }

    return left.station.name.localeCompare(right.station.name);
  });
};
