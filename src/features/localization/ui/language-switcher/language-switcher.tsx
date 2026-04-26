import { LANGUAGES, useLocalizationStore, useTranslation, type Language } from '@features/localization';
import S from './language-switcher.module.css';

const LANGUAGE_OPTIONS: Array<{
  value: Language;
  label: string;
}> = [
  {
    value: LANGUAGES.EN,
    label: 'EN',
  },
  {
    value: LANGUAGES.RU,
    label: 'RU',
  },
];

export const LanguageSwitcher = () => {
  const language = useLocalizationStore((state) => state.language);
  const setLanguage = useLocalizationStore((state) => state.actions.setLanguage);

  const t = useTranslation();

  return (
    <div className={S.switcher} aria-label={t.languageSwitcher.ariaLabel}>
      {LANGUAGE_OPTIONS.map((option) => (
        <button
          key={option.value}
          className={`${S.button} ${language === option.value ? S.buttonActive : ''}`}
          type="button"
          onClick={() => setLanguage(option.value)}
          aria-pressed={language === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
