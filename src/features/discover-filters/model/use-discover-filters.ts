import { useMemo, useState } from 'react';
import { DEFAULT_DISCOVER_FILTERS, normalizeDiscoverFilters, type DiscoverFiltersState } from './index';

type UseDiscoverFiltersResult = {
  filters: DiscoverFiltersState;
  normalizedFilters: DiscoverFiltersState;
  setCountry: (value: string) => void;
  setLanguage: (value: string) => void;
  setHideBroken: (value: boolean) => void;
  resetFilters: () => void;
};

export const useDiscoverFilters = (): UseDiscoverFiltersResult => {
  const [filters, setFilters] = useState<DiscoverFiltersState>(DEFAULT_DISCOVER_FILTERS);

  const normalizedFilters = useMemo(() => {
    return normalizeDiscoverFilters(filters);
  }, [filters]);

  const setCountry = (value: string) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      country: value,
    }));
  };

  const setLanguage = (value: string) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      language: value,
    }));
  };

  const setHideBroken = (value: boolean) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      hideBroken: value,
    }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_DISCOVER_FILTERS);
  };

  return {
    filters,
    normalizedFilters,
    setCountry,
    setLanguage,
    setHideBroken,
    resetFilters,
  };
};
