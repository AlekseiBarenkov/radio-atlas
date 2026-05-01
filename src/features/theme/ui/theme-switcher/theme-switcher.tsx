import { useTranslation } from '@features/localization';
import { THEMES, useThemeStore, type Theme } from '@features/theme';
import S from './theme-switcher.module.css';

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

  return (
    <div className={S.switcher} aria-label={t.themeSwitcher.ariaLabel}>
      {themeOptions.map((option) => (
        <button
          key={option.value}
          className={`${S.button} ${theme === option.value ? S.buttonActive : ''}`}
          type="button"
          onClick={() => setTheme(option.value)}
          aria-pressed={theme === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
