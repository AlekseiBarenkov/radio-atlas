import { type ChangeEvent, type KeyboardEvent, useRef, useState } from 'react';
import { useDiscoverContext } from '../../model';
import S from './discover-search-form.module.css';

const SEARCH_DEBOUNCE_MS = 400;

export const DiscoverSearchForm = () => {
  const { search, onSearchChange } = useDiscoverContext();

  const [inputValue, setInputValue] = useState(search);
  const debounceTimeoutRef = useRef<number | null>(null);

  const clearDebounceTimeout = () => {
    if (debounceTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = null;
  };

  const scheduleChange = (value: string) => {
    clearDebounceTimeout();

    debounceTimeoutRef.current = window.setTimeout(() => {
      debounceTimeoutRef.current = null;
      onSearchChange(value);
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    setInputValue(nextValue);
    scheduleChange(nextValue);
  };

  const handleBlur = () => {
    clearDebounceTimeout();
    onSearchChange(inputValue);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    clearDebounceTimeout();
    onSearchChange(inputValue);
  };

  return (
    <form className={S.form} role="search">
      <label className={S.label} htmlFor="discover-search">
        Search stations
      </label>

      <input
        id="discover-search"
        name="discover-search"
        type="search"
        className={S.input}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Search by station name"
        autoComplete="off"
      />
    </form>
  );
};
