import type { DiscoverSort } from './types';

export const DISCOVER_SORTS = {
  POPULAR: 'popular',
  TRENDING: 'trending',
  NAME: 'name',
} as const;

export const DEFAULT_DISCOVER_SORT: DiscoverSort = DISCOVER_SORTS.POPULAR;
