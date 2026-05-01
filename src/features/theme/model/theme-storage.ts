import { THEME_STORAGE_KEY, THEMES } from './constants';
import type { Theme } from './types';

export const isTheme = (value: unknown): value is Theme => {
  return value === THEMES.LIGHT || value === THEMES.DARK || value === THEMES.SYSTEM;
};

export const loadTheme = (): Theme | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = window.localStorage.getItem(THEME_STORAGE_KEY);

  return isTheme(value) ? value : null;
};

export const saveTheme = (theme: Theme) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
};
