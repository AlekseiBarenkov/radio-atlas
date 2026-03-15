import { create } from 'zustand';
import type { PlayerStore } from './types';
import { PLAYER_STATUSES } from './types';

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentStation: null,
  status: PLAYER_STATUSES.IDLE,
  errorMessage: null,

  actions: {
    playStation: (station) => {
      set({
        currentStation: station,
        status: PLAYER_STATUSES.PLAYING,
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
        status: PLAYER_STATUSES.PLAYING,
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
        status: message ? PLAYER_STATUSES.ERROR : PLAYER_STATUSES.IDLE,
      });
    },
  },
}));
