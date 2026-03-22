import type { RadioStation } from '@entities/station/model/types';
import { PLAYER_STATUSES, type PlayerActions, type PlayerStatus } from '../model/types';

type RunPlayerPrimaryActionParams = {
  status: PlayerStatus;
  isReconnectSuggested: boolean;
  currentStation: RadioStation | null;
  targetStation?: RadioStation;
  actions: Pick<PlayerActions, 'playStation' | 'pause' | 'resume' | 'restartCurrentStation'>;
};

export const runPlayerPrimaryAction = (params: RunPlayerPrimaryActionParams) => {
  const { status, isReconnectSuggested, currentStation, targetStation, actions } = params;

  if (!currentStation && !targetStation) {
    return;
  }

  const isCurrentTargetStation =
    Boolean(currentStation) && Boolean(targetStation) && currentStation?.stationuuid === targetStation?.stationuuid;

  if (targetStation && !isCurrentTargetStation) {
    actions.playStation(targetStation);

    return;
  }

  if (status === PLAYER_STATUSES.PLAYING) {
    actions.pause();

    return;
  }

  if (status === PLAYER_STATUSES.PAUSED) {
    actions.resume();

    return;
  }

  if (status === PLAYER_STATUSES.ERROR) {
    actions.restartCurrentStation();

    return;
  }

  if (status === PLAYER_STATUSES.BUFFERING) {
    if (isReconnectSuggested) {
      actions.restartCurrentStation();
    }

    return;
  }

  actions.resume();
};
