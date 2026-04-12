import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearchStationCountries, useSearchStationLanguages } from '@entities/station';
import {
  mapDiscoverFilterOptions,
  normalizeDiscoverFilters,
  setDiscoverFiltersToSearchParams,
  useDiscoverFilters,
  type DiscoverFiltersState,
} from '@features/discover-filters';
import { useDebouncedValue } from '@shared/hooks';

type UseDiscoverPageFiltersParams = {
  initialFilters: DiscoverFiltersState;
  onAppliedFiltersChange: () => void;
};

type UseDiscoverPageFiltersResult = {
  filters: ReturnType<typeof useDiscoverFilters>['filters'];
  drafts: ReturnType<typeof useDiscoverFilters>['drafts'];
  countryOptions: ReturnType<typeof mapDiscoverFilterOptions>;
  languageOptions: ReturnType<typeof mapDiscoverFilterOptions>;
  isCountryOptionsLoading: boolean;
  isLanguageOptionsLoading: boolean;
  handleCountryChange: (value: string) => void;
  handleLanguageChange: (value: string) => void;
  handleCountrySelect: (value: string) => void;
  handleLanguageSelect: (value: string) => void;
  handleHideBrokenChange: (value: boolean) => void;
  handleResetFilters: () => void;
};

const FILTER_SUGGESTIONS_LIMIT = 8;
const FILTER_SUGGESTIONS_DEBOUNCE_MS = 400;
const FILTERS_DEBOUNCE_MS = 400;

const isSameFilters = (left: DiscoverFiltersState, right: DiscoverFiltersState): boolean => {
  return left.country === right.country && left.language === right.language && left.hideBroken === right.hideBroken;
};

export const useDiscoverPageFilters = (params: UseDiscoverPageFiltersParams): UseDiscoverPageFiltersResult => {
  const { initialFilters, onAppliedFiltersChange } = params;

  const normalizedInitialFilters = useMemo(() => {
    return normalizeDiscoverFilters(initialFilters);
  }, [initialFilters]);

  const previousDebouncedFiltersRef = useRef(normalizedInitialFilters);

  const [, setSearchParams] = useSearchParams();

  const {
    filters,
    drafts,
    setCountryDraft,
    setLanguageDraft,
    applyCountry,
    applyLanguage,
    setHideBroken,
    resetFilters,
  } = useDiscoverFilters({
    initialFilters: normalizedInitialFilters,
  });

  const debouncedFilters = useDebouncedValue(filters, FILTERS_DEBOUNCE_MS);
  const debouncedCountryDraft = useDebouncedValue(drafts.country, FILTER_SUGGESTIONS_DEBOUNCE_MS);
  const debouncedLanguageDraft = useDebouncedValue(drafts.language, FILTER_SUGGESTIONS_DEBOUNCE_MS);

  const countrySuggestionsQuery = useSearchStationCountries({
    query: debouncedCountryDraft,
    limit: FILTER_SUGGESTIONS_LIMIT,
  });

  const languageSuggestionsQuery = useSearchStationLanguages({
    query: debouncedLanguageDraft,
    limit: FILTER_SUGGESTIONS_LIMIT,
  });

  const countryOptions = useMemo(() => {
    return mapDiscoverFilterOptions(countrySuggestionsQuery.data ?? []);
  }, [countrySuggestionsQuery.data]);

  const languageOptions = useMemo(() => {
    return mapDiscoverFilterOptions(languageSuggestionsQuery.data ?? []);
  }, [languageSuggestionsQuery.data]);

  useEffect(() => {
    const normalizedDebouncedFilters = normalizeDiscoverFilters(debouncedFilters);

    if (isSameFilters(normalizedDebouncedFilters, normalizedInitialFilters)) {
      previousDebouncedFiltersRef.current = normalizedDebouncedFilters;
      return;
    }

    if (isSameFilters(normalizedDebouncedFilters, previousDebouncedFiltersRef.current)) {
      return;
    }

    previousDebouncedFiltersRef.current = normalizedDebouncedFilters;

    setSearchParams((currentSearchParams) => {
      return setDiscoverFiltersToSearchParams(currentSearchParams, normalizedDebouncedFilters);
    });

    onAppliedFiltersChange();
  }, [debouncedFilters, normalizedInitialFilters, onAppliedFiltersChange, setSearchParams]);

  const handleCountryChange = (value: string) => {
    setCountryDraft(value);
  };

  const handleLanguageChange = (value: string) => {
    setLanguageDraft(value);
  };

  const handleCountrySelect = (value: string) => {
    applyCountry(value);
  };

  const handleLanguageSelect = (value: string) => {
    applyLanguage(value);
  };

  const handleHideBrokenChange = (value: boolean) => {
    setHideBroken(value);
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  return {
    filters,
    drafts,
    countryOptions,
    languageOptions,
    isCountryOptionsLoading: countrySuggestionsQuery.isPending,
    isLanguageOptionsLoading: languageSuggestionsQuery.isPending,
    handleCountryChange,
    handleLanguageChange,
    handleCountrySelect,
    handleLanguageSelect,
    handleHideBrokenChange,
    handleResetFilters,
  };
};
