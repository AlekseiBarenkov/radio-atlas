import type { PlaybackGuard } from './player-runtime-types';

export const createPlaybackGuard = (): PlaybackGuard => {
  let activeRequestId = 0;

  return {
    next: () => {
      activeRequestId += 1;

      return activeRequestId;
    },
    current: () => {
      return activeRequestId;
    },
    isActual: (requestId) => {
      return requestId === activeRequestId;
    },
  };
};
