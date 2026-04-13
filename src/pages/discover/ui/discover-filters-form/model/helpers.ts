export type DiscoverSuggestionOption = {
  value: string;
  label: string;
  secondaryLabel?: string;
};

export const shouldShowSuggestions = (inputValue: string, appliedValue: string, isOpen: boolean): boolean => {
  return isOpen && inputValue.length > 0 && inputValue !== appliedValue;
};

export const getFirstOptionValue = (options: DiscoverSuggestionOption[]): string | null => {
  return options[0]?.value ?? null;
};

export const getSuggestionsQueryValue = (inputValue: string, appliedValue: string): string => {
  return inputValue === appliedValue ? '' : inputValue;
};
