import { PLAYER_STATUSES, type PlayerStatus } from '@features/player';
import type { RadioStation } from '../model/types';

type GetStationPlayerStateParams = {
  station: RadioStation;
  currentStation: RadioStation | null;
  playerStatus: PlayerStatus;
};

export type StationPlayerState = {
  isCurrentStation: boolean;
  isButtonBusy: boolean;
};

export const getStationPlayerState = (params: GetStationPlayerStateParams): StationPlayerState => {
  const { station, currentStation, playerStatus } = params;

  const isCurrentStation = currentStation?.stationuuid === station.stationuuid;
  const isButtonBusy = isCurrentStation && playerStatus === PLAYER_STATUSES.LOADING;

  return {
    isCurrentStation,
    isButtonBusy,
  };
};
