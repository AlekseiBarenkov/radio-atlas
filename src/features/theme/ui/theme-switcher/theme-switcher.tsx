import { useTranslation } from '@features/localization';
import { THEMES, useThemeStore, type Theme } from '@features/theme';
import { ToggleGroup } from '@/shared/ui';

type ThemeOption = {
  value: Theme;
  label: string;
};

export const ThemeSwitcher = () => {
  const t = useTranslation();

  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.actions.setTheme);

  const themeOptions: ThemeOption[] = [
    {
      value: THEMES.LIGHT,
      label: t.themeSwitcher.light,
    },
    {
      value: THEMES.DARK,
      label: t.themeSwitcher.dark,
    },
    {
      value: THEMES.SYSTEM,
      label: t.themeSwitcher.system,
    },
  ];

  return <ToggleGroup label={t.themeSwitcher.ariaLabel} value={theme} options={themeOptions} onChange={setTheme} />;
};
