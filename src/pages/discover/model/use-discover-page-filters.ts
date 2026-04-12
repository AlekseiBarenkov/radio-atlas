import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearchStationCountries, useSearchStationLanguages } from '@entities/station';
import {
  DEFAULT_DISCOVER_FILTERS,
  mapDiscoverFilterOptions,
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
  normalizedFilters: ReturnType<typeof useDiscoverFilters>['normalizedFilters'];
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

export const useDiscoverPageFilters = (params: UseDiscoverPageFiltersParams): UseDiscoverPageFiltersResult => {
  const { initialFilters, onAppliedFiltersChange } = params;

  const [, setSearchParams] = useSearchParams();

  const {
    filters,
    drafts,
    normalizedFilters,
    setCountryDraft,
    setLanguageDraft,
    applyCountry,
    applyLanguage,
    setHideBroken,
    resetFilters,
  } = useDiscoverFilters({
    initialFilters,
  });

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

  const syncFiltersToUrl = (nextFilters: typeof filters) => {
    setSearchParams((currentSearchParams) => {
      return setDiscoverFiltersToSearchParams(currentSearchParams, nextFilters);
    });
  };

  const applyFiltersChange = (callback: () => void, nextFilters: typeof filters) => {
    callback();
    syncFiltersToUrl(nextFilters);
    onAppliedFiltersChange();
  };

  const handleCountryChange = (value: string) => {
    setCountryDraft(value);

    if (value.trim().length > 0) {
      return;
    }

    const nextFilters = {
      ...filters,
      country: '',
    };

    syncFiltersToUrl(nextFilters);
    onAppliedFiltersChange();
  };

  const handleLanguageChange = (value: string) => {
    setLanguageDraft(value);

    if (value.trim().length > 0) {
      return;
    }

    const nextFilters = {
      ...filters,
      language: '',
    };

    syncFiltersToUrl(nextFilters);
    onAppliedFiltersChange();
  };

  const handleCountrySelect = (value: string) => {
    const nextFilters = {
      ...filters,
      country: value,
    };

    applyFiltersChange(() => {
      applyCountry(value);
    }, nextFilters);
  };

  const handleLanguageSelect = (value: string) => {
    const nextFilters = {
      ...filters,
      language: value,
    };

    applyFiltersChange(() => {
      applyLanguage(value);
    }, nextFilters);
  };

  const handleHideBrokenChange = (value: boolean) => {
    const nextFilters = {
      ...filters,
      hideBroken: value,
    };

    applyFiltersChange(() => {
      setHideBroken(value);
    }, nextFilters);
  };

  const handleResetFilters = () => {
    applyFiltersChange(() => {
      resetFilters();
    }, DEFAULT_DISCOVER_FILTERS);
  };

  return {
    filters,
    drafts,
    normalizedFilters,
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
