import { useMemo, useState } from 'react';
import {
  DEFAULT_DISCOVER_FILTER_DRAFTS,
  DEFAULT_DISCOVER_FILTERS,
  normalizeDiscoverFilters,
  type DiscoverFiltersDraftState,
  type DiscoverFiltersState,
} from './index';

type UseDiscoverFiltersParams = {
  initialFilters?: DiscoverFiltersState;
};

type UseDiscoverFiltersResult = {
  filters: DiscoverFiltersState;
  drafts: DiscoverFiltersDraftState;
  normalizedFilters: DiscoverFiltersState;
  setCountryDraft: (value: string) => void;
  setLanguageDraft: (value: string) => void;
  applyCountry: (value: string) => void;
  applyLanguage: (value: string) => void;
  setHideBroken: (value: boolean) => void;
  resetFilters: () => void;
};

const isEmptyValue = (value: string): boolean => {
  return value.trim().length === 0;
};

const getDraftsFromFilters = (filters: DiscoverFiltersState): DiscoverFiltersDraftState => {
  return {
    country: filters.country,
    language: filters.language,
  };
};

export const useDiscoverFilters = (params: UseDiscoverFiltersParams = {}): UseDiscoverFiltersResult => {
  const initialFilters = useMemo(() => {
    return normalizeDiscoverFilters(params.initialFilters ?? DEFAULT_DISCOVER_FILTERS);
  }, [params.initialFilters]);

  const initialDrafts = useMemo(() => {
    return getDraftsFromFilters(initialFilters);
  }, [initialFilters]);

  const [filters, setFilters] = useState<DiscoverFiltersState>(initialFilters);
  const [drafts, setDrafts] = useState<DiscoverFiltersDraftState>(initialDrafts);

  const normalizedFilters = useMemo(() => {
    return normalizeDiscoverFilters(filters);
  }, [filters]);

  const setCountryDraft = (value: string) => {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      country: value,
    }));

    if (isEmptyValue(value)) {
      setFilters((currentFilters) => ({
        ...currentFilters,
        country: '',
      }));
    }
  };

  const setLanguageDraft = (value: string) => {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      language: value,
    }));

    if (isEmptyValue(value)) {
      setFilters((currentFilters) => ({
        ...currentFilters,
        language: '',
      }));
    }
  };

  const applyCountry = (value: string) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      country: value,
    }));

    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      country: value,
    }));
  };

  const applyLanguage = (value: string) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      language: value,
    }));

    setDrafts((currentDrafts) => ({
      ...currentDrafts,
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
    setDrafts(DEFAULT_DISCOVER_FILTER_DRAFTS);
  };

  return {
    filters,
    drafts,
    normalizedFilters,
    setCountryDraft,
    setLanguageDraft,
    applyCountry,
    applyLanguage,
    setHideBroken,
    resetFilters,
  };
};
