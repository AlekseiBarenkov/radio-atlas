import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearchStationCountries, useSearchStationLanguages } from '@entities/station';
import {
  DEFAULT_DISCOVER_FILTERS,
  DiscoverFiltersForm,
  mapDiscoverFilterOptions,
  normalizeDiscoverFilters,
  setDiscoverFiltersToSearchParams,
  type DiscoverFiltersFieldName,
  type DiscoverFiltersState,
} from '@features/discover-filters';
import { useDebouncedValue } from '@shared/hooks';
import { DiscoverSearchForm } from '../discover-search-form';
import S from './discover-page-filters.module.css';

type DiscoverPageFiltersProps = {
  initialFilters: DiscoverFiltersState;
  searchValue: string;
  onSearchChange: (value: string) => void;
};

const FILTER_SUGGESTIONS_LIMIT = 8;
const FILTER_SUGGESTIONS_DEBOUNCE_MS = 400;

const updateSearchParams = (searchParams: URLSearchParams, filters: DiscoverFiltersState): URLSearchParams => {
  return setDiscoverFiltersToSearchParams(searchParams, normalizeDiscoverFilters(filters));
};

const getSuggestionsQueryValue = (inputValue: string, appliedValue: string): string => {
  return inputValue.trim() === appliedValue.trim() ? '' : inputValue;
};

export const DiscoverPageFilters = (props: DiscoverPageFiltersProps) => {
  const { initialFilters, searchValue, onSearchChange } = props;

  const normalizedInitialFilters = normalizeDiscoverFilters(initialFilters);

  const [, setSearchParams] = useSearchParams();

  const [countryValue, setCountryValue] = useState(normalizedInitialFilters.country);
  const [languageValue, setLanguageValue] = useState(normalizedInitialFilters.language);

  const debouncedCountryValue = useDebouncedValue(countryValue, FILTER_SUGGESTIONS_DEBOUNCE_MS);
  const debouncedLanguageValue = useDebouncedValue(languageValue, FILTER_SUGGESTIONS_DEBOUNCE_MS);

  const countrySuggestionsQueryValue = getSuggestionsQueryValue(
    debouncedCountryValue,
    normalizedInitialFilters.country,
  );

  const languageSuggestionsQueryValue = getSuggestionsQueryValue(
    debouncedLanguageValue,
    normalizedInitialFilters.language,
  );

  const countrySuggestionsQuery = useSearchStationCountries({
    query: countrySuggestionsQueryValue,
    limit: FILTER_SUGGESTIONS_LIMIT,
  });

  const languageSuggestionsQuery = useSearchStationLanguages({
    query: languageSuggestionsQueryValue,
    limit: FILTER_SUGGESTIONS_LIMIT,
  });

  const countryOptions = mapDiscoverFilterOptions(countrySuggestionsQuery.data ?? []);
  const languageOptions = mapDiscoverFilterOptions(languageSuggestionsQuery.data ?? []);

  const applyFilters = (nextFilters: DiscoverFiltersState) => {
    setSearchParams((currentSearchParams) => {
      return updateSearchParams(currentSearchParams, nextFilters);
    });
  };

  const setInputValue = (name: DiscoverFiltersFieldName, value: string) => {
    if (name === 'country') {
      setCountryValue(value);
      return;
    }

    setLanguageValue(value);
  };

  const handleFilterChange = (name: DiscoverFiltersFieldName, value: string) => {
    setInputValue(name, value);

    if (value.trim().length > 0 || normalizedInitialFilters[name].length === 0) {
      return;
    }

    applyFilters({
      ...normalizedInitialFilters,
      [name]: '',
    });
  };

  const handleFilterSelect = (name: DiscoverFiltersFieldName, value: string) => {
    setInputValue(name, value);

    applyFilters({
      ...normalizedInitialFilters,
      [name]: value,
    });
  };

  const handleHideBrokenChange = (value: boolean) => {
    applyFilters({
      ...normalizedInitialFilters,
      hideBroken: value,
    });
  };

  const handleResetFilters = () => {
    setCountryValue(DEFAULT_DISCOVER_FILTERS.country);
    setLanguageValue(DEFAULT_DISCOVER_FILTERS.language);

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
        onCountryChange={(value) => handleFilterChange('country', value)}
        onLanguageChange={(value) => handleFilterChange('language', value)}
        onCountrySelect={(value) => handleFilterSelect('country', value)}
        onLanguageSelect={(value) => handleFilterSelect('language', value)}
        onHideBrokenChange={handleHideBrokenChange}
        onReset={handleResetFilters}
      />
    </div>
  );
};
