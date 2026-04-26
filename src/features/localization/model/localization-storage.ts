import { LANGUAGE_STORAGE_KEY, LANGUAGES } from './constants';
import type { Language } from './types';

export const isLanguage = (value: unknown): value is Language => {
  return value === LANGUAGES.RU || value === LANGUAGES.EN;
};

export const loadLanguage = (): Language | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

  return isLanguage(value) ? value : null;
};

export const saveLanguage = (language: Language) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
};
