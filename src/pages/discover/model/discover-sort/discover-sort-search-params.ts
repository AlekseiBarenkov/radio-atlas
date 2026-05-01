import { DEFAULT_DISCOVER_SORT, DISCOVER_SORTS } from './constants';
import type { DiscoverSort } from './types';

const SORT_PARAM_NAME = 'sort';

export const isDiscoverSort = (value: unknown): value is DiscoverSort => {
  return value === DISCOVER_SORTS.POPULAR || value === DISCOVER_SORTS.TRENDING || value === DISCOVER_SORTS.NAME;
};

export const getDiscoverSortFromSearchParams = (searchParams: URLSearchParams): DiscoverSort => {
  const value = searchParams.get(SORT_PARAM_NAME);

  return isDiscoverSort(value) ? value : DEFAULT_DISCOVER_SORT;
};

export const setDiscoverSortToSearchParams = (searchParams: URLSearchParams, sort: DiscoverSort): URLSearchParams => {
  const nextSearchParams = new URLSearchParams(searchParams);

  if (sort === DEFAULT_DISCOVER_SORT) {
    nextSearchParams.delete(SORT_PARAM_NAME);
  } else {
    nextSearchParams.set(SORT_PARAM_NAME, sort);
  }

  return nextSearchParams;
};
