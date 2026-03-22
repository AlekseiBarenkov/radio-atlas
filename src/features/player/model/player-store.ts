import { create } from 'zustand';
import { PLAYER_STATUSES, type PlayerStore } from './types';

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentStation: null,
  status: PLAYER_STATUSES.IDLE,
  errorMessage: null,
  reconnectAt: null,
  isReconnectSuggested: false,

  actions: {
    playStation: (station) => {
      set({
        currentStation: station,
        status: PLAYER_STATUSES.LOADING,
        errorMessage: null,
        reconnectAt: null,
        isReconnectSuggested: false,
      });
    },

    pause: () => {
      const currentStation = get().currentStation;

      if (!currentStation) {
        return;
      }

      set({
        status: PLAYER_STATUSES.PAUSED,
        isReconnectSuggested: false,
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
        isReconnectSuggested: false,
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
        isReconnectSuggested: false,
      });
    },

    stop: () => {
      set({
        currentStation: null,
        status: PLAYER_STATUSES.IDLE,
        errorMessage: null,
        reconnectAt: null,
        isReconnectSuggested: false,
      });
    },

    setStatus: (status) => {
      set({
        status,
        isReconnectSuggested: status === PLAYER_STATUSES.BUFFERING ? get().isReconnectSuggested : false,
      });
    },

    setError: (message) => {
      set({
        errorMessage: message,
        status: PLAYER_STATUSES.ERROR,
        isReconnectSuggested: false,
      });
    },

    setReconnectSuggested: (value) => {
      set({
        isReconnectSuggested: value,
      });
    },
  },
}));
