import type { Translation } from '@features/localization';
import { PLAYER_STATUSES, type PlayerStatus } from '../model/types';

type GetPlayerPrimaryButtonLabelParams = {
  status: PlayerStatus;
  isReconnectSuggested: boolean;
  isCurrentStation?: boolean;
  t: Translation;
};

export const getPlayerPrimaryButtonLabel = (params: GetPlayerPrimaryButtonLabelParams): string => {
  const { status, isReconnectSuggested, isCurrentStation = true, t } = params;

  if (!isCurrentStation) {
    return t.player.play;
  }

  if (status === PLAYER_STATUSES.LOADING) {
    return t.player.loading;
  }

  if (status === PLAYER_STATUSES.BUFFERING) {
    return isReconnectSuggested ? t.player.reconnect : t.player.buffering;
  }

  if (status === PLAYER_STATUSES.PAUSED) {
    return t.player.resume;
  }

  if (status === PLAYER_STATUSES.PLAYING) {
    return t.player.pause;
  }

  if (status === PLAYER_STATUSES.ERROR) {
    return t.player.retry;
  }

  return t.player.play;
};

type GetPlayerStatusMessageParams = {
  status: PlayerStatus;
  isReconnectSuggested: boolean;
  errorMessage: string | null;
  t: Translation;
};

type PlayerStatusMessage = {
  text: string;
  tone: 'info' | 'error' | null;
};

export const getPlayerStatusMessage = (params: GetPlayerStatusMessageParams): PlayerStatusMessage => {
  const { status, isReconnectSuggested, errorMessage, t } = params;

  if (status === PLAYER_STATUSES.LOADING) {
    return {
      text: t.player.connecting,
      tone: 'info',
    };
  }

  if (status === PLAYER_STATUSES.BUFFERING) {
    return {
      text: isReconnectSuggested ? t.player.longBuffering : t.player.streamBuffering,
      tone: 'info',
    };
  }

  if (status === PLAYER_STATUSES.PAUSED) {
    return {
      text: t.player.paused,
      tone: 'info',
    };
  }

  if (status === PLAYER_STATUSES.ERROR) {
    return {
      text: errorMessage === 'playback-error' || errorMessage === null ? t.player.playbackError : errorMessage,
      tone: 'error',
    };
  }

  return {
    text: '',
    tone: null,
  };
};
