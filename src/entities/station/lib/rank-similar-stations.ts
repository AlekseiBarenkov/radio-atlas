import type { RadioStation } from '../model/types';

export type SimilarStationCandidate = {
  station: RadioStation;
  score: number;
  fallbackIndex: number;
};

type RankedSimilarStationCandidate = SimilarStationCandidate & {
  rankingScore: number;
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

const POPULARITY_SCORE_LIMIT = 10;

const getPopularityScore = (station: RadioStation): number => {
  const clickScore = Math.min(station.clickcount / 1000, POPULARITY_SCORE_LIMIT);
  const votesScore = Math.min(station.votes / 100, POPULARITY_SCORE_LIMIT);

  return clickScore + votesScore;
};

export const rankSimilarStations = (params: RankSimilarStationsParams): SimilarStationCandidate[] => {
  const { candidates, currentStation } = params;

  const rankedCandidates: RankedSimilarStationCandidate[] = candidates.map((candidate) => ({
    ...candidate,
    rankingScore:
      candidate.score + getSimilarityScore(candidate.station, currentStation) + getPopularityScore(candidate.station),
  }));

  return rankedCandidates.sort((left, right) => {
    const leftScore = left.score + getSimilarityScore(left.station, currentStation) + getPopularityScore(left.station);
    const rightScore =
      right.score + getSimilarityScore(right.station, currentStation) + getPopularityScore(right.station);

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
