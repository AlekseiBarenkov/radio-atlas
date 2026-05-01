import { create } from 'zustand';
import { getInitialTheme, resolveTheme } from './get-initial-theme';
import { applyThemeToDocument } from './theme-dom';
import { saveTheme } from './theme-storage';
import type { ResolvedTheme, Theme } from './types';

type ThemeState = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
};

type ThemeActions = {
  setTheme: (theme: Theme) => void;
};

export type ThemeStore = ThemeState & {
  actions: ThemeActions;
};

const initialTheme = getInitialTheme();
const initialResolvedTheme = resolveTheme(initialTheme);

applyThemeToDocument(initialResolvedTheme);

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: initialTheme,
  resolvedTheme: initialResolvedTheme,

  actions: {
    setTheme: (theme) => {
      const resolvedTheme = resolveTheme(theme);

      saveTheme(theme);
      applyThemeToDocument(resolvedTheme);

      set({
        theme,
        resolvedTheme,
      });
    },
  },
}));
