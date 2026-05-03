import { useToastStore } from './toast-store';

export const useToastActions = () => {
  return useToastStore((state) => state.actions);
};
