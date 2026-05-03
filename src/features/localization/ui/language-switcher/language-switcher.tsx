import { LANGUAGES, useLocalizationStore, useTranslation, type Language } from '@features/localization';
import { ToggleGroup } from '@/shared/ui';

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
    <ToggleGroup
      label={t.languageSwitcher.ariaLabel}
      value={language}
      options={LANGUAGE_OPTIONS}
      onChange={setLanguage}
    />
  );
};
