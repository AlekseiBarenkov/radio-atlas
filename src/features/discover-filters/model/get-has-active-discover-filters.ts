import type { DiscoverFiltersState } from './types';

export const getHasActiveDiscoverFilters = (filters: DiscoverFiltersState): boolean => {
  return filters.country.trim().length > 0 || filters.language.trim().length > 0 || filters.hideBroken === false;
};
