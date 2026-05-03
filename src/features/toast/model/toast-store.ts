import { create } from 'zustand';
import { DEFAULT_TOAST_DURATION_MS, ERROR_TOAST_DURATION_MS, MAX_TOASTS } from './constants';
import { TOAST_TONES, type ShowToastParams, type ToastItem } from './types';

type ToastState = {
  toasts: ToastItem[];
};

type ToastActions = {
  showToast: (params: ShowToastParams) => string;
  closeToast: (toastId: string) => void;
  clearToasts: () => void;
};

type ToastStore = ToastState & {
  actions: ToastActions;
};

const toastTimeoutIds = new Map<string, number>();

const getToastDuration = (params: ShowToastParams): number => {
  if (params.durationMs !== undefined) {
    return params.durationMs;
  }

  return params.tone === TOAST_TONES.ERROR ? ERROR_TOAST_DURATION_MS : DEFAULT_TOAST_DURATION_MS;
};

const createToastId = (): string => {
  return `toast-${Date.now()}-${crypto.randomUUID()}`;
};

const clearToastTimeout = (toastId: string) => {
  const timeoutId = toastTimeoutIds.get(toastId);

  if (timeoutId === undefined) {
    return;
  }

  window.clearTimeout(timeoutId);
  toastTimeoutIds.delete(toastId);
};

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  actions: {
    showToast: (params) => {
      const toast: ToastItem = {
        id: createToastId(),
        tone: params.tone ?? TOAST_TONES.INFO,
        title: params.title,
        description: params.description,
        durationMs: getToastDuration(params),
      };

      const currentToasts = get().toasts;
      const removedToasts = currentToasts.slice(MAX_TOASTS - 1);

      removedToasts.forEach((removedToast) => {
        clearToastTimeout(removedToast.id);
      });

      set({
        toasts: [toast, ...currentToasts].slice(0, MAX_TOASTS),
      });

      const timeoutId = window.setTimeout(() => {
        get().actions.closeToast(toast.id);
      }, toast.durationMs);

      toastTimeoutIds.set(toast.id, timeoutId);

      return toast.id;
    },

    closeToast: (toastId) => {
      clearToastTimeout(toastId);

      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== toastId),
      }));
    },

    clearToasts: () => {
      toastTimeoutIds.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });

      toastTimeoutIds.clear();

      set({
        toasts: [],
      });
    },
  },
}));
