import { usePlayerStore } from './player-store';

export const useCurrentStation = () => {
  return usePlayerStore((state) => state.currentStation);
};

export const usePlayerStatus = () => {
  return usePlayerStore((state) => state.status);
};

export const usePlayerError = () => {
  return usePlayerStore((state) => state.errorMessage);
};

export const useIsReconnectSuggested = () => {
  return usePlayerStore((state) => state.isReconnectSuggested);
};

export const usePlayerActions = () => {
  return usePlayerStore((state) => state.actions);
};
