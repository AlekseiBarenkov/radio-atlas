import type { DiscoverFiltersDraftState, DiscoverFiltersState } from './types';

export const DEFAULT_DISCOVER_FILTERS: DiscoverFiltersState = {
  country: '',
  language: '',
  hideBroken: true,
};

export const DEFAULT_DISCOVER_FILTER_DRAFTS: DiscoverFiltersDraftState = {
  country: '',
  language: '',
};
