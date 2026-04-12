import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearchStationCountries, useSearchStationLanguages } from '@entities/station';
import {
  DEFAULT_DISCOVER_FILTERS,
  DiscoverFiltersForm,
  mapDiscoverFilterOptions,
  normalizeDiscoverFilters,
  setDiscoverFiltersToSearchParams,
  type DiscoverFiltersState,
} from '@features/discover-filters';
import { useDebouncedValue } from '@shared/hooks';
import { DiscoverSearchForm } from '../discover-search-form';
import S from './discover-page-filters.module.css';

type DiscoverPageFiltersProps = {
  initialFilters: DiscoverFiltersState;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAppliedFiltersChange: () => void;
};

const FILTER_SUGGESTIONS_LIMIT = 8;
const FILTER_SUGGESTIONS_DEBOUNCE_MS = 400;

const updateSearchParams = (searchParams: URLSearchParams, filters: DiscoverFiltersState): URLSearchParams => {
  return setDiscoverFiltersToSearchParams(searchParams, normalizeDiscoverFilters(filters));
};

export const DiscoverPageFilters = (props: DiscoverPageFiltersProps) => {
  const { initialFilters, searchValue, onSearchChange, onAppliedFiltersChange } = props;

  const normalizedInitialFilters = useMemo(() => {
    return normalizeDiscoverFilters(initialFilters);
  }, [initialFilters]);

  const [, setSearchParams] = useSearchParams();

  const [countryValue, setCountryValue] = useState(normalizedInitialFilters.country);
  const [languageValue, setLanguageValue] = useState(normalizedInitialFilters.language);

  useEffect(() => {
    setCountryValue(normalizedInitialFilters.country);
    setLanguageValue(normalizedInitialFilters.language);
  }, [normalizedInitialFilters]);

  const debouncedCountryValue = useDebouncedValue(countryValue, FILTER_SUGGESTIONS_DEBOUNCE_MS);
  const debouncedLanguageValue = useDebouncedValue(languageValue, FILTER_SUGGESTIONS_DEBOUNCE_MS);

  const countrySuggestionsQuery = useSearchStationCountries({
    query: debouncedCountryValue,
    limit: FILTER_SUGGESTIONS_LIMIT,
  });

  const languageSuggestionsQuery = useSearchStationLanguages({
    query: debouncedLanguageValue,
    limit: FILTER_SUGGESTIONS_LIMIT,
  });

  const countryOptions = useMemo(() => {
    return mapDiscoverFilterOptions(countrySuggestionsQuery.data ?? []);
  }, [countrySuggestionsQuery.data]);

  const languageOptions = useMemo(() => {
    return mapDiscoverFilterOptions(languageSuggestionsQuery.data ?? []);
  }, [languageSuggestionsQuery.data]);

  const applyFilters = (nextFilters: DiscoverFiltersState) => {
    setSearchParams((currentSearchParams) => {
      return updateSearchParams(currentSearchParams, nextFilters);
    });

    onAppliedFiltersChange();
  };

  const handleCountryChange = (value: string) => {
    setCountryValue(value);

    if (value.trim().length === 0 && normalizedInitialFilters.country.length > 0) {
      applyFilters({
        ...normalizedInitialFilters,
        country: '',
      });
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguageValue(value);

    if (value.trim().length === 0 && normalizedInitialFilters.language.length > 0) {
      applyFilters({
        ...normalizedInitialFilters,
        language: '',
      });
    }
  };

  const handleCountrySelect = (value: string) => {
    setCountryValue(value);

    applyFilters({
      ...normalizedInitialFilters,
      country: value,
    });
  };

  const handleLanguageSelect = (value: string) => {
    setLanguageValue(value);

    applyFilters({
      ...normalizedInitialFilters,
      language: value,
    });
  };

  const handleHideBrokenChange = (value: boolean) => {
    applyFilters({
      ...normalizedInitialFilters,
      hideBroken: value,
    });
  };

  const handleResetFilters = () => {
    setCountryValue('');
    setLanguageValue('');

    applyFilters(DEFAULT_DISCOVER_FILTERS);
  };

  return (
    <div className={S.controls}>
      <DiscoverSearchForm initialValue={searchValue} onChange={onSearchChange} />

      <DiscoverFiltersForm
        filters={normalizedInitialFilters}
        countryValue={countryValue}
        languageValue={languageValue}
        countryOptions={countryOptions}
        languageOptions={languageOptions}
        isCountryOptionsLoading={countrySuggestionsQuery.isPending}
        isLanguageOptionsLoading={languageSuggestionsQuery.isPending}
        onCountryChange={handleCountryChange}
        onLanguageChange={handleLanguageChange}
        onCountrySelect={handleCountrySelect}
        onLanguageSelect={handleLanguageSelect}
        onHideBrokenChange={handleHideBrokenChange}
        onReset={handleResetFilters}
      />
    </div>
  );
};
