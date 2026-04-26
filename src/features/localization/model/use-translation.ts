import { dictionary } from '../config/dictionary';
import { useLocalizationStore } from './localization-store';
import type { Translation } from '../config/en';

export const useTranslation = (): Translation => {
  const language = useLocalizationStore((state) => state.language);

  return dictionary[language];
};
