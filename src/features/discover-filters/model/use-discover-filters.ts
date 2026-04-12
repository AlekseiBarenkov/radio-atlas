import { useMemo, useState } from 'react';
import {
  DEFAULT_DISCOVER_FILTER_DRAFTS,
  DEFAULT_DISCOVER_FILTERS,
  normalizeDiscoverFilters,
  type DiscoverFiltersDraftState,
  type DiscoverFiltersState,
} from './index';

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

export const useDiscoverFilters = (): UseDiscoverFiltersResult => {
  const [filters, setFilters] = useState<DiscoverFiltersState>(DEFAULT_DISCOVER_FILTERS);
  const [drafts, setDrafts] = useState<DiscoverFiltersDraftState>(DEFAULT_DISCOVER_FILTER_DRAFTS);

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
