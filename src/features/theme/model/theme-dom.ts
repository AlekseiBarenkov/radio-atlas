import type { ResolvedTheme } from './types';

export const applyThemeToDocument = (theme: ResolvedTheme) => {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.dataset.theme = theme;
};
