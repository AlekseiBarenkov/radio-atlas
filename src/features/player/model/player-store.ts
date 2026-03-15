import { create } from 'zustand';
import { PLAYER_STATUSES, type PlayerStore } from './types';

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentStation: null,
  status: PLAYER_STATUSES.IDLE,
  errorMessage: null,

  actions: {
    playStation: (station) => {
      set({
        currentStation: station,
        status: PLAYER_STATUSES.LOADING,
        errorMessage: null,
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

    stop: () => {
      set({
        currentStation: null,
        status: PLAYER_STATUSES.IDLE,
        errorMessage: null,
      });
    },

    setStatus: (status) => {
      set({
        status,
      });
    },

    setError: (message) => {
      set({
        errorMessage: message,
        status: PLAYER_STATUSES.ERROR,
      });
    },
  },
}));
