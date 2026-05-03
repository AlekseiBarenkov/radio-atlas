export const TOAST_TONES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

export type ToastTone = (typeof TOAST_TONES)[keyof typeof TOAST_TONES];

export type ToastItem = {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  durationMs: number;
};

export type ShowToastParams = {
  tone?: ToastTone;
  title: string;
  description?: string;
  durationMs?: number;
};
