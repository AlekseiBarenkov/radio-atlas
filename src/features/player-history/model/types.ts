import type { RadioStation } from '@entities/station';

export type PlayerHistoryStation = RadioStation;

export type PlayerHistoryState = {
  stations: PlayerHistoryStation[];
};

export type PlayerHistoryActions = {
  addStation: (station: PlayerHistoryStation) => void;
  clear: () => void;
};

export type PlayerHistoryStore = PlayerHistoryState & {
  actions: PlayerHistoryActions;
};
