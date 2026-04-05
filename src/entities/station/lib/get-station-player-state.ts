import { PLAYER_STATUSES, type PlayerStatus } from '@features/player';
import type { RadioStation } from '../model/types';

type GetStationPlayerStateParams = {
  station: RadioStation;
  currentStation: RadioStation | null;
  playerStatus: PlayerStatus;
  errorMessage: string | null;
  isReconnectSuggested: boolean;
};

export type StationPlayerState = {
  isCurrentStation: boolean;
  isButtonBusy: boolean;
  hasCurrentStationError: boolean;
  statusMessage: {
    text: string;
    tone: 'info' | 'error' | null;
  };
};

const getStatusMessage = (params: {
  isCurrentStation: boolean;
  playerStatus: PlayerStatus;
  errorMessage: string | null;
  isReconnectSuggested: boolean;
}): StationPlayerState['statusMessage'] => {
  const { isCurrentStation, playerStatus, errorMessage, isReconnectSuggested } = params;

  if (!isCurrentStation) {
    return {
      text: '',
      tone: null,
    };
  }

  if (playerStatus === PLAYER_STATUSES.LOADING) {
    return {
      text: 'Подключение к станции...',
      tone: 'info',
    };
  }

  if (playerStatus === PLAYER_STATUSES.BUFFERING) {
    return {
      text: isReconnectSuggested ? 'Поток долго буферизуется. Попробуйте переподключить.' : 'Буферизация потока...',
      tone: 'info',
    };
  }

  if (playerStatus === PLAYER_STATUSES.PAUSED) {
    return {
      text: 'Пауза',
      tone: 'info',
    };
  }

  if (playerStatus === PLAYER_STATUSES.ERROR) {
    return {
      text: errorMessage ?? 'Ошибка воспроизведения',
      tone: 'error',
    };
  }

  return {
    text: '',
    tone: null,
  };
};

export const getStationPlayerState = (params: GetStationPlayerStateParams): StationPlayerState => {
  const { station, currentStation, playerStatus, errorMessage, isReconnectSuggested } = params;

  const isCurrentStation = currentStation?.stationuuid === station.stationuuid;
  const isButtonBusy = isCurrentStation && playerStatus === PLAYER_STATUSES.LOADING;
  const hasCurrentStationError = isCurrentStation && playerStatus === PLAYER_STATUSES.ERROR && Boolean(errorMessage);

  return {
    isCurrentStation,
    isButtonBusy,
    hasCurrentStationError,
    statusMessage: getStatusMessage({
      isCurrentStation,
      playerStatus,
      errorMessage,
      isReconnectSuggested,
    }),
  };
};
