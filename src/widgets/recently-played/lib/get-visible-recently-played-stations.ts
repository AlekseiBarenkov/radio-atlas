import type { PlayerHistoryStation } from '@features/player-history';

const RECENTLY_PLAYED_VISIBLE_LIMIT = 6;

export const getVisibleRecentlyPlayedStations = (stations: PlayerHistoryStation[]): PlayerHistoryStation[] => {
  return stations.slice(0, RECENTLY_PLAYED_VISIBLE_LIMIT);
};
