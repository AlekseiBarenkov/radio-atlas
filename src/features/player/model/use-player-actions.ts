import { usePlayerStore } from './player-store';

export const usePlayerActions = () => {
  return usePlayerStore((state) => state.actions);
};
