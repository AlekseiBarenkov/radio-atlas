import { DEFAULT_DISCOVER_FILTERS } from './constants';
import type { DiscoverFiltersState } from './types';

export const getHasActiveDiscoverFilters = (filters: DiscoverFiltersState): boolean => {
  return (
    filters.country.length > 0 ||
    filters.language.length > 0 ||
    filters.tag.length > 0 ||
    filters.hideBroken !== DEFAULT_DISCOVER_FILTERS.hideBroken
  );
};
