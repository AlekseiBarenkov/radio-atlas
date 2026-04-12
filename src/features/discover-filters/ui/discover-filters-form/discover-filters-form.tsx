import { type ChangeEvent, type FocusEvent, type KeyboardEvent, useState } from 'react';
import type { DiscoverFilterOption, DiscoverFiltersState } from '../../model';
import { getHasActiveDiscoverFilters } from '../../model';
import S from './discover-filters-form.module.css';

type DiscoverFiltersFormProps = {
  filters: DiscoverFiltersState;
  countryValue: string;
  languageValue: string;
  countryOptions: DiscoverFilterOption[];
  languageOptions: DiscoverFilterOption[];
  isCountryOptionsLoading?: boolean;
  isLanguageOptionsLoading?: boolean;
  onCountryChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onHideBrokenChange: (value: boolean) => void;
  onCountrySelect: (value: string) => void;
  onLanguageSelect: (value: string) => void;
  onReset: () => void;
};

const isSameValue = (left: string, right: string): boolean => {
  return left.trim() === right.trim();
};

const hasInputValues = (params: { countryValue: string; languageValue: string }): boolean => {
  return params.countryValue.trim().length > 0 || params.languageValue.trim().length > 0;
};

const shouldShowSuggestions = (inputValue: string, appliedValue: string, isOpen: boolean): boolean => {
  return isOpen && inputValue.trim().length > 0 && !isSameValue(inputValue, appliedValue);
};

const getFirstOptionValue = (options: DiscoverFilterOption[]): string | null => {
  return options[0]?.value ?? null;
};

export const DiscoverFiltersForm = (props: DiscoverFiltersFormProps) => {
  const {
    filters,
    countryValue,
    languageValue,
    countryOptions,
    languageOptions,
    isCountryOptionsLoading = false,
    isLanguageOptionsLoading = false,
    onCountryChange,
    onLanguageChange,
    onHideBrokenChange,
    onCountrySelect,
    onLanguageSelect,
    onReset,
  } = props;

  const [isCountrySuggestionsOpen, setIsCountrySuggestionsOpen] = useState(false);
  const [isLanguageSuggestionsOpen, setIsLanguageSuggestionsOpen] = useState(false);

  const hasActiveFilters = getHasActiveDiscoverFilters(filters);
  const isResetDisabled = !hasActiveFilters && !hasInputValues({ countryValue, languageValue });

  const countrySuggestionsId = 'discover-filter-country-suggestions';
  const languageSuggestionsId = 'discover-filter-language-suggestions';

  const handleCountryChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIsCountrySuggestionsOpen(true);
    onCountryChange(event.target.value);
  };

  const handleLanguageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIsLanguageSuggestionsOpen(true);
    onLanguageChange(event.target.value);
  };

  const handleHideBrokenChange = (event: ChangeEvent<HTMLInputElement>) => {
    onHideBrokenChange(event.target.checked);
  };

  const handleCountryFocus = () => {
    setIsCountrySuggestionsOpen(true);
  };

  const handleLanguageFocus = () => {
    setIsLanguageSuggestionsOpen(true);
  };

  const handleCountryBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }

    setIsCountrySuggestionsOpen(false);
  };

  const handleLanguageBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }

    setIsLanguageSuggestionsOpen(false);
  };

  const handleCountrySelect = (value: string) => {
    onCountrySelect(value);
    setIsCountrySuggestionsOpen(false);
  };

  const handleLanguageSelect = (value: string) => {
    onLanguageSelect(value);
    setIsLanguageSuggestionsOpen(false);
  };

  const handleCountryKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      onCountryChange(filters.country);
      setIsCountrySuggestionsOpen(false);
      return;
    }

    if (event.key !== 'Enter' || isCountryOptionsLoading) {
      return;
    }

    const firstOptionValue = getFirstOptionValue(countryOptions);

    if (!firstOptionValue) {
      return;
    }

    event.preventDefault();
    handleCountrySelect(firstOptionValue);
  };

  const handleLanguageKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      onLanguageChange(filters.language);
      setIsLanguageSuggestionsOpen(false);
      return;
    }

    if (event.key !== 'Enter' || isLanguageOptionsLoading) {
      return;
    }

    const firstOptionValue = getFirstOptionValue(languageOptions);

    if (!firstOptionValue) {
      return;
    }

    event.preventDefault();
    handleLanguageSelect(firstOptionValue);
  };

  const handleReset = () => {
    setIsCountrySuggestionsOpen(false);
    setIsLanguageSuggestionsOpen(false);
    onReset();
  };

  return (
    <div className={S.form}>
      <div className={S.field} onBlur={handleCountryBlur}>
        <label className={S.label} htmlFor="discover-filter-country">
          Country
        </label>

        <input
          id="discover-filter-country"
          name="discover-filter-country"
          type="text"
          role="combobox"
          aria-haspopup="listbox"
          className={S.input}
          value={countryValue}
          onChange={handleCountryChange}
          onFocus={handleCountryFocus}
          onKeyDown={handleCountryKeyDown}
          placeholder="Type country"
          autoComplete="off"
          aria-expanded={shouldShowSuggestions(countryValue, filters.country, isCountrySuggestionsOpen)}
          aria-controls={countrySuggestionsId}
          aria-autocomplete="list"
        />

        {shouldShowSuggestions(countryValue, filters.country, isCountrySuggestionsOpen) && (
          <div id={countrySuggestionsId} className={S.suggestions} role="listbox">
            {isCountryOptionsLoading ? (
              <div className={S.statusText}>Loading countries...</div>
            ) : countryOptions.length === 0 ? (
              <div className={S.statusText}>No matching countries</div>
            ) : (
              countryOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={false}
                  className={S.suggestionButton}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleCountrySelect(option.value);
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

      <div className={S.field} onBlur={handleLanguageBlur}>
        <label className={S.label} htmlFor="discover-filter-language">
          Language
        </label>

        <input
          id="discover-filter-language"
          name="discover-filter-language"
          type="text"
          role="combobox"
          aria-haspopup="listbox"
          className={S.input}
          value={languageValue}
          onChange={handleLanguageChange}
          onFocus={handleLanguageFocus}
          onKeyDown={handleLanguageKeyDown}
          placeholder="Type language"
          autoComplete="off"
          aria-expanded={shouldShowSuggestions(languageValue, filters.language, isLanguageSuggestionsOpen)}
          aria-controls={languageSuggestionsId}
          aria-autocomplete="list"
        />

        {shouldShowSuggestions(languageValue, filters.language, isLanguageSuggestionsOpen) && (
          <div id={languageSuggestionsId} className={S.suggestions} role="listbox">
            {isLanguageOptionsLoading ? (
              <div className={S.statusText}>Loading languages...</div>
            ) : languageOptions.length === 0 ? (
              <div className={S.statusText}>No matching languages</div>
            ) : (
              languageOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={false}
                  className={S.suggestionButton}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleLanguageSelect(option.value);
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

      <label className={S.checkboxLabel}>
        <input className={S.checkbox} type="checkbox" checked={filters.hideBroken} onChange={handleHideBrokenChange} />
        Hide broken stations
      </label>

      <div className={S.actions}>
        <button className={S.resetButton} type="button" onClick={handleReset} disabled={isResetDisabled}>
          Clear filters
        </button>
      </div>
    </div>
  );
};
