import type { RadioStation } from '@entities/station';
import { usePlayerHistoryStore } from '../model/player-history-store';

export const addStationToHistory = (station: RadioStation) => {
  usePlayerHistoryStore.getState().actions.addStation(station);
};
