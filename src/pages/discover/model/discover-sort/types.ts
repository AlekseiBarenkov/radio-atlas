import type { DISCOVER_SORTS } from './constants';

export type DiscoverSort = (typeof DISCOVER_SORTS)[keyof typeof DISCOVER_SORTS];
