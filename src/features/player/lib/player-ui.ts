import { PLAYER_STATUSES, type PlayerStatus } from '../model/types';

type GetPlayerPrimaryButtonLabelParams = {
  status: PlayerStatus;
  isReconnectSuggested: boolean;
  isCurrentStation?: boolean;
};

export const getPlayerPrimaryButtonLabel = (params: GetPlayerPrimaryButtonLabelParams): string => {
  const { status, isReconnectSuggested, isCurrentStation = true } = params;

  if (!isCurrentStation) {
    return 'Play';
  }

  if (status === PLAYER_STATUSES.LOADING) {
    return 'Loading...';
  }

  if (status === PLAYER_STATUSES.BUFFERING) {
    return isReconnectSuggested ? 'Reconnect' : 'Buffering...';
  }

  if (status === PLAYER_STATUSES.PAUSED) {
    return 'Resume';
  }

  if (status === PLAYER_STATUSES.PLAYING) {
    return 'Pause';
  }

  if (status === PLAYER_STATUSES.ERROR) {
    return 'Retry';
  }

  return 'Play';
};

type GetPlayerStatusMessageParams = {
  status: PlayerStatus;
  isReconnectSuggested: boolean;
  errorMessage: string | null;
};

type PlayerStatusMessage = {
  text: string;
  tone: 'info' | 'error' | null;
};

export const getPlayerStatusMessage = (params: GetPlayerStatusMessageParams): PlayerStatusMessage => {
  const { status, isReconnectSuggested, errorMessage } = params;

  if (status === PLAYER_STATUSES.LOADING) {
    return {
      text: 'Подключение к станции...',
      tone: 'info',
    };
  }

  if (status === PLAYER_STATUSES.BUFFERING) {
    return {
      text: isReconnectSuggested ? 'Поток долго буферизуется. Попробуйте переподключить.' : 'Буферизация потока...',
      tone: 'info',
    };
  }

  if (status === PLAYER_STATUSES.PAUSED) {
    return {
      text: 'Пауза',
      tone: 'info',
    };
  }

  if (status === PLAYER_STATUSES.ERROR) {
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
