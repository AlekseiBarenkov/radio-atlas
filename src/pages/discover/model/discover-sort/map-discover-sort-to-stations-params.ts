import type { GetStationsParams } from '@entities/station';
import { DISCOVER_SORTS } from './constants';
import type { DiscoverSort } from './types';

type DiscoverSortStationsParams = Pick<GetStationsParams, 'order' | 'reverse'>;

export const mapDiscoverSortToStationsParams = (sort: DiscoverSort): DiscoverSortStationsParams => {
  if (sort === DISCOVER_SORTS.TRENDING) {
    return {
      order: 'clicktrend',
      reverse: true,
    };
  }

  if (sort === DISCOVER_SORTS.NAME) {
    return {
      order: 'name',
      reverse: false,
    };
  }

  return {
    order: 'clickcount',
    reverse: true,
  };
};
