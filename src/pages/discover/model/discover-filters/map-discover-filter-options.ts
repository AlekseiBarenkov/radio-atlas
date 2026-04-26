import type { StationCountrySuggestion, StationLanguageSuggestion, StationTagSuggestion } from '@entities/station';
import type { DiscoverFilterOption } from './types';

type StationFilterOption = StationCountrySuggestion | StationLanguageSuggestion | StationTagSuggestion;

const getStationCountLabel = (stationCount: number): string => {
  return stationCount === 1 ? '1 station' : `${stationCount} stations`;
};

export const mapDiscoverFilterOptions = (options: StationFilterOption[]): DiscoverFilterOption[] => {
  return options.map((option) => ({
    value: option.name,
    label: option.name,
    secondaryLabel: getStationCountLabel(option.stationCount),
  }));
};
