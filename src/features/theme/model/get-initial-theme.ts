import { COLOR_SCHEME_DARK_QUERY, RESOLVED_THEMES, THEMES } from './constants';
import { loadTheme } from './theme-storage';
import type { ResolvedTheme, Theme } from './types';

export const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') {
    return RESOLVED_THEMES.LIGHT;
  }

  return window.matchMedia(COLOR_SCHEME_DARK_QUERY).matches ? RESOLVED_THEMES.DARK : RESOLVED_THEMES.LIGHT;
};

export const resolveTheme = (theme: Theme): ResolvedTheme => {
  return theme === THEMES.SYSTEM ? getSystemTheme() : theme;
};

export const getInitialTheme = (): Theme => {
  return loadTheme() ?? THEMES.SYSTEM;
};
