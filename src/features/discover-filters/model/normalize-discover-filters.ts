import type { DiscoverFiltersState } from './types';

export const normalizeDiscoverFilters = (filters: DiscoverFiltersState): DiscoverFiltersState => {
  return {
    country: filters.country.trim(),
    language: filters.language.trim(),
    hideBroken: filters.hideBroken,
  };
};
