import { type ChangeEvent, type KeyboardEvent, useRef, useState } from 'react';
import {
  getFirstOptionValue,
  shouldShowSuggestions,
  type DiscoverSuggestionOption,
} from '../discover-filters-form/model/helpers';
import S from '../discover-filters-form/discover-filters-form.module.css';
import { Drop, DropList, Input } from '@/shared/ui';

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
  showSuggestionsOnEmptyInput?: boolean;
  onInputChange: (value: string) => void;
  onAppliedChange: (value: string) => void;
  onInputFocus?: () => void;
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
    showSuggestionsOnEmptyInput = false,
    onInputChange,
    onAppliedChange,
    onInputFocus,
  } = props;

  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [activeOptionValue, setActiveOptionValue] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const suggestionsId = `${inputId}-suggestions`;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    setIsSuggestionsOpen(true);
    setActiveOptionValue(null);
    onInputChange(nextValue);

    if (nextValue.length > 0 || appliedValue.length === 0) {
      return;
    }

    onAppliedChange('');
  };

  const handleFocus = () => {
    setIsSuggestionsOpen(true);
    setActiveOptionValue(null);
    onInputFocus?.();
  };

  const handleSelect = (nextValue: string) => {
    onInputChange(nextValue);
    onAppliedChange(nextValue);
    setIsSuggestionsOpen(false);
    setActiveOptionValue(null);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      onInputChange(appliedValue);
      setActiveOptionValue(null);
      setIsSuggestionsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (!isSuggestionsVisible || isOptionsLoading || options.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();

      const currentIndex = options.findIndex((option) => option.value === activeOptionValue);
      const nextIndex = currentIndex === -1 ? 0 : Math.min(currentIndex + 1, options.length - 1);

      setActiveOptionValue(options[nextIndex]?.value ?? null);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();

      const currentIndex = options.findIndex((option) => option.value === activeOptionValue);
      const nextIndex = currentIndex === -1 ? options.length - 1 : Math.max(currentIndex - 1, 0);

      setActiveOptionValue(options[nextIndex]?.value ?? null);
      return;
    }

    if (event.key !== 'Enter') {
      return;
    }

    const selectedValue = activeOptionValue ?? getFirstOptionValue(options);

    if (!selectedValue) {
      return;
    }

    event.preventDefault();
    handleSelect(selectedValue);
  };

  const isSuggestionsVisible = shouldShowSuggestions({
    inputValue,
    appliedValue,
    isOpen: isSuggestionsOpen,
    showOnEmptyInput: showSuggestionsOnEmptyInput,
  });

  return (
    <div className={S.field}>
      <label className={S.label} htmlFor={inputId}>
        {label}
      </label>

      <Drop
        open={isSuggestionsVisible}
        onOpenChange={setIsSuggestionsOpen}
        contentClassName={S.suggestions}
        trigger={
          <Input
            ref={inputRef}
            id={inputId}
            name={inputName}
            type="text"
            role="combobox"
            aria-haspopup="listbox"
            value={inputValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            aria-expanded={isSuggestionsVisible}
            aria-controls={suggestionsId}
            aria-autocomplete="list"
          />
        }
      >
        <DropList
          id={suggestionsId}
          options={options}
          isLoading={isOptionsLoading}
          loadingText={loadingText}
          emptyText={emptyText}
          activeValue={activeOptionValue}
          onSelect={handleSelect}
        />
      </Drop>
    </div>
  );
};
