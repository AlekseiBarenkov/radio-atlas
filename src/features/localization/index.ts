export { dictionary } from './config/dictionary';
export type { Translation } from './config/en';

export { LANGUAGES } from './model/constants';
export type { Language } from './model/types';

export { getInitialLanguage } from './model/get-initial-language';

export { useLocalizationStore } from './model/localization-store';
export type { LocalizationStore } from './model/localization-store';

export { useTranslation } from './model/use-translation';

export { LanguageSwitcher } from './ui/language-switcher';
