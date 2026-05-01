export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export const RESOLVED_THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export const THEME_STORAGE_KEY = 'radio-atlas:theme';

export const COLOR_SCHEME_DARK_QUERY = '(prefers-color-scheme: dark)';
