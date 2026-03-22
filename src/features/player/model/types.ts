import type { RadioStation } from '@entities/station';

export const PLAYER_STATUSES = {
  IDLE: 'idle',
  LOADING: 'loading',
  PLAYING: 'playing',
  PAUSED: 'paused',
  BUFFERING: 'buffering',
  ERROR: 'error',
} as const;

export type PlayerStatus = (typeof PLAYER_STATUSES)[keyof typeof PLAYER_STATUSES];

export type PlayerState = {
  currentStation: RadioStation | null;
  status: PlayerStatus;
  errorMessage: string | null;
  reconnectAt: number | null;
  isReconnectSuggested: boolean;
};

export type PlayerActions = {
  playStation: (station: RadioStation) => void;
  pause: () => void;
  resume: () => void;
  restartCurrentStation: () => void;
  stop: () => void;
  setStatus: (status: PlayerStatus) => void;
  setError: (message: string | null) => void;
  setReconnectSuggested: (value: boolean) => void;
};

export type PlayerStore = PlayerState & {
  actions: PlayerActions;
};
