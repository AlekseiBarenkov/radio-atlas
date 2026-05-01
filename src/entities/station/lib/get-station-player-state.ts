import { PLAYER_STATUSES, type PlayerStatus } from '@features/player';
import type { RadioStation } from '../model/types';
import type { Translation } from '@/features/localization';

type GetStationPlayerStateParams = {
  station: RadioStation;
  currentStation: RadioStation | null;
  playerStatus: PlayerStatus;
  errorMessage: string | null;
  isReconnectSuggested: boolean;
  t: Translation;
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
  t: Translation;
}): StationPlayerState['statusMessage'] => {
  const { isCurrentStation, playerStatus, errorMessage, isReconnectSuggested, t } = params;

  if (!isCurrentStation) {
    return {
      text: '',
      tone: null,
    };
  }

  if (playerStatus === PLAYER_STATUSES.LOADING) {
    return {
      text: t.player.connecting,
      tone: 'info',
    };
  }

  if (playerStatus === PLAYER_STATUSES.BUFFERING) {
    return {
      text: isReconnectSuggested ? t.player.longBuffering : t.player.streamBuffering,
      tone: 'info',
    };
  }

  if (playerStatus === PLAYER_STATUSES.PAUSED) {
    return {
      text: t.player.paused,
      tone: 'info',
    };
  }

  if (playerStatus === PLAYER_STATUSES.ERROR) {
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

export const getStationPlayerState = (params: GetStationPlayerStateParams): StationPlayerState => {
  const { station, currentStation, playerStatus, errorMessage, isReconnectSuggested, t } = params;

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
      t,
    }),
  };
};
