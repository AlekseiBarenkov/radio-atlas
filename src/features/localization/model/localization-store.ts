import { create } from 'zustand';
import { getInitialLanguage } from './get-initial-language';
import { saveLanguage } from './localization-storage';
import type { Language } from './types';

type LocalizationState = {
  language: Language;
};

type LocalizationActions = {
  setLanguage: (language: Language) => void;
};

export type LocalizationStore = LocalizationState & {
  actions: LocalizationActions;
};

export const useLocalizationStore = create<LocalizationStore>((set) => ({
  language: getInitialLanguage(),

  actions: {
    setLanguage: (language) => {
      saveLanguage(language);

      set({
        language,
      });
    },
  },
}));
