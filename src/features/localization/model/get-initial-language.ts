import { LANGUAGES } from './constants';
import { loadLanguage } from './localization-storage';
import type { Language } from './types';

const getSystemLanguage = (): Language => {
  if (typeof navigator === 'undefined') {
    return LANGUAGES.EN;
  }

  return navigator.language.toLocaleLowerCase().startsWith(LANGUAGES.RU) ? LANGUAGES.RU : LANGUAGES.EN;
};

export const getInitialLanguage = (): Language => {
  return loadLanguage() ?? getSystemLanguage();
};
