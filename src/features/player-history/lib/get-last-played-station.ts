import type { PlayerHistoryStation } from '../model/types';

export const getLastPlayedStation = (stations: PlayerHistoryStation[]): PlayerHistoryStation | null => {
  return stations[0] ?? null;
};
