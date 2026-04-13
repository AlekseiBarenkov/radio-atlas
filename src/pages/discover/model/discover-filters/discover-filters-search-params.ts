import { DEFAULT_DISCOVER_FILTERS } from './constants';
import type { DiscoverFiltersState } from './types';

const COUNTRY_PARAM_NAME = 'country';
const LANGUAGE_PARAM_NAME = 'language';
const HIDE_BROKEN_PARAM_NAME = 'hideBroken';

const FALSE_PARAM_VALUE = 'false';

const getNormalizedParamValue = (searchParams: URLSearchParams, key: string): string => {
  return searchParams.get(key)?.trim() ?? '';
};

const getHideBrokenValue = (searchParams: URLSearchParams): boolean => {
  return searchParams.get(HIDE_BROKEN_PARAM_NAME) !== FALSE_PARAM_VALUE;
};

export const getDiscoverFiltersFromSearchParams = (searchParams: URLSearchParams): DiscoverFiltersState => {
  return {
    country: getNormalizedParamValue(searchParams, COUNTRY_PARAM_NAME),
    language: getNormalizedParamValue(searchParams, LANGUAGE_PARAM_NAME),
    hideBroken: getHideBrokenValue(searchParams),
  };
};

export const setDiscoverFiltersToSearchParams = (
  searchParams: URLSearchParams,
  filters: DiscoverFiltersState,
): URLSearchParams => {
  const nextSearchParams = new URLSearchParams(searchParams);

  if (filters.country.length > 0) {
    nextSearchParams.set(COUNTRY_PARAM_NAME, filters.country);
  } else {
    nextSearchParams.delete(COUNTRY_PARAM_NAME);
  }

  if (filters.language.length > 0) {
    nextSearchParams.set(LANGUAGE_PARAM_NAME, filters.language);
  } else {
    nextSearchParams.delete(LANGUAGE_PARAM_NAME);
  }

  if (filters.hideBroken === DEFAULT_DISCOVER_FILTERS.hideBroken) {
    nextSearchParams.delete(HIDE_BROKEN_PARAM_NAME);
  } else {
    nextSearchParams.set(HIDE_BROKEN_PARAM_NAME, FALSE_PARAM_VALUE);
  }

  return nextSearchParams;
};
