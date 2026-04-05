import { create } from 'zustand';
import { getPlayerHistoryLimit, loadPlayerHistoryStations, savePlayerHistoryStations } from './player-history-storage';
import type { PlayerHistoryStation, PlayerHistoryStore } from './types';

const getNextPlayerHistoryStations = (
  currentStations: PlayerHistoryStation[],
  station: PlayerHistoryStation,
): PlayerHistoryStation[] => {
  const filteredStations = currentStations.filter((item) => item.stationuuid !== station.stationuuid);

  return [station, ...filteredStations].slice(0, getPlayerHistoryLimit());
};

export const usePlayerHistoryStore = create<PlayerHistoryStore>((set, get) => ({
  stations: loadPlayerHistoryStations(),

  actions: {
    addStation: (station) => {
      const nextStations = getNextPlayerHistoryStations(get().stations, station);

      savePlayerHistoryStations(nextStations);

      set({
        stations: nextStations,
      });
    },

    clear: () => {
      savePlayerHistoryStations([]);

      set({
        stations: [],
      });
    },
  },
}));
