import { create } from 'zustand';
import { addStationToHistory } from '@features/player-history';
import { PLAYER_STATUSES, type PlayerStore } from './types';
import { loadPlayerVolume, normalizePlayerVolume, savePlayerVolume } from './player-volume-storage';

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentStation: null,
  status: PLAYER_STATUSES.IDLE,
  errorMessage: null,
  reconnectAt: null,
  volume: loadPlayerVolume(),

  actions: {
    playStation: (station) => {
      addStationToHistory(station);

      set({
        currentStation: station,
        status: PLAYER_STATUSES.LOADING,
        errorMessage: null,
        reconnectAt: null,
      });
    },

    pause: () => {
      const currentStation = get().currentStation;

      if (!currentStation) {
        return;
      }

      set({
        status: PLAYER_STATUSES.PAUSED,
      });
    },

    resume: () => {
      const currentStation = get().currentStation;

      if (!currentStation) {
        return;
      }

      set({
        status: PLAYER_STATUSES.LOADING,
        errorMessage: null,
      });
    },

    restartCurrentStation: () => {
      const currentStation = get().currentStation;

      if (!currentStation) {
        return;
      }

      set({
        status: PLAYER_STATUSES.LOADING,
        errorMessage: null,
        reconnectAt: Date.now(),
      });
    },

    stop: () => {
      set({
        currentStation: null,
        status: PLAYER_STATUSES.IDLE,
        errorMessage: null,
        reconnectAt: null,
      });
    },

    setStatus: (status) => set({ status }),

    setError: (message) => {
      set({
        errorMessage: message,
        status: PLAYER_STATUSES.ERROR,
      });
    },

    setVolume: (volume) => {
      const nextVolume = normalizePlayerVolume(volume);

      if (get().volume === nextVolume) {
        return;
      }

      savePlayerVolume(nextVolume);

      set({
        volume: nextVolume,
      });
    },
  },
}));
