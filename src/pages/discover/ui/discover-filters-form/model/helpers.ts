export type DiscoverSuggestionOption = {
  value: string;
  label: string;
  secondaryLabel?: string;
};

type ShouldShowSuggestionsParams = {
  inputValue: string;
  appliedValue: string;
  isOpen: boolean;
  showOnEmptyInput?: boolean;
};

export const shouldShowSuggestions = (params: ShouldShowSuggestionsParams): boolean => {
  const { inputValue, appliedValue, isOpen, showOnEmptyInput = false } = params;

  if (!isOpen) {
    return false;
  }

  if (inputValue.length === 0) {
    return showOnEmptyInput;
  }

  return inputValue !== appliedValue;
};

export const getFirstOptionValue = (options: DiscoverSuggestionOption[]): string | null => {
  return options[0]?.value ?? null;
};

export const getSuggestionsQueryValue = (inputValue: string, appliedValue: string): string => {
  return inputValue === appliedValue ? '' : inputValue;
};
