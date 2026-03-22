import { usePlayerStore } from './player-store';
import { PLAYER_STATUSES } from './types';

type PlayerUiState = {
  currentStation: ReturnType<typeof usePlayerStore.getState>['currentStation'];
  playerStatus: ReturnType<typeof usePlayerStore.getState>['status'];
  errorMessage: ReturnType<typeof usePlayerStore.getState>['errorMessage'];
  isReconnectSuggested: boolean;

  isIdle: boolean;
  isLoading: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isBuffering: boolean;
  isError: boolean;
};

export const usePlayerUiState = (): PlayerUiState => {
  const currentStation = usePlayerStore((state) => state.currentStation);
  const playerStatus = usePlayerStore((state) => state.status);
  const errorMessage = usePlayerStore((state) => state.errorMessage);
  const isReconnectSuggested = usePlayerStore((state) => state.isReconnectSuggested);

  const isIdle = currentStation === null;
  const isLoading = playerStatus === PLAYER_STATUSES.LOADING;
  const isPlaying = playerStatus === PLAYER_STATUSES.PLAYING;
  const isPaused = playerStatus === PLAYER_STATUSES.PAUSED;
  const isBuffering = playerStatus === PLAYER_STATUSES.BUFFERING;
  const isError = playerStatus === PLAYER_STATUSES.ERROR;

  return {
    currentStation,
    playerStatus,
    errorMessage,
    isReconnectSuggested,

    isIdle,
    isLoading,
    isPlaying,
    isPaused,
    isBuffering,
    isError,
  };
};
