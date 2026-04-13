import { type ChangeEvent, type FocusEvent, type KeyboardEvent, useState } from 'react';
import {
  getFirstOptionValue,
  shouldShowSuggestions,
  type DiscoverSuggestionOption,
} from '../discover-filters-form/model/helpers';
import S from '../discover-filters-form/discover-filters-form.module.css';

type DiscoverSuggestFilterProps = {
  inputId: string;
  inputName: string;
  label: string;
  placeholder: string;
  inputValue: string;
  appliedValue: string;
  options: DiscoverSuggestionOption[];
  isOptionsLoading: boolean;
  loadingText: string;
  emptyText: string;
  onInputChange: (value: string) => void;
  onAppliedChange: (value: string) => void;
};

export const DiscoverSuggestFilter = (props: DiscoverSuggestFilterProps) => {
  const {
    inputId,
    inputName,
    label,
    placeholder,
    inputValue,
    appliedValue,
    options,
    isOptionsLoading,
    loadingText,
    emptyText,
    onInputChange,
    onAppliedChange,
  } = props;

  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  const suggestionsId = `${inputId}-suggestions`;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    setIsSuggestionsOpen(true);
    onInputChange(nextValue);

    if (nextValue.length > 0 || appliedValue.length === 0) {
      return;
    }

    onAppliedChange('');
  };

  const handleFocus = () => {
    setIsSuggestionsOpen(true);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }

    setIsSuggestionsOpen(false);
  };

  const handleSelect = (nextValue: string) => {
    onInputChange(nextValue);
    onAppliedChange(nextValue);
    setIsSuggestionsOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      onInputChange(appliedValue);
      setIsSuggestionsOpen(false);
      return;
    }

    if (event.key !== 'Enter' || isOptionsLoading) {
      return;
    }

    const firstOptionValue = getFirstOptionValue(options);

    if (!firstOptionValue) {
      return;
    }

    event.preventDefault();
    handleSelect(firstOptionValue);
  };

  return (
    <div className={S.field} onBlur={handleBlur}>
      <label className={S.label} htmlFor={inputId}>
        {label}
      </label>

      <input
        id={inputId}
        name={inputName}
        type="text"
        role="combobox"
        aria-haspopup="listbox"
        className={S.input}
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        aria-expanded={shouldShowSuggestions(inputValue, appliedValue, isSuggestionsOpen)}
        aria-controls={suggestionsId}
        aria-autocomplete="list"
      />

      {shouldShowSuggestions(inputValue, appliedValue, isSuggestionsOpen) && (
        <div id={suggestionsId} className={S.suggestions} role="listbox">
          {isOptionsLoading ? (
            <div className={S.statusText}>{loadingText}</div>
          ) : options.length === 0 ? (
            <div className={S.statusText}>{emptyText}</div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={false}
                className={S.suggestionButton}
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelect(option.value);
                }}
              >
                <span className={S.suggestionPrimary}>{option.label}</span>
                {option.secondaryLabel && <span className={S.suggestionSecondary}>{option.secondaryLabel}</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
