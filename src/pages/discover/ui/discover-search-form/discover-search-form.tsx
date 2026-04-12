import { type ChangeEvent, type KeyboardEvent, useRef, useState } from 'react';
import S from './discover-search-form.module.css';

type DiscoverSearchFormProps = {
  initialValue: string;
  onChange: (value: string) => void;
};

const SEARCH_DEBOUNCE_MS = 400;

export const DiscoverSearchForm = (props: DiscoverSearchFormProps) => {
  const { initialValue, onChange } = props;

  const [inputValue, setInputValue] = useState(initialValue);
  const debounceTimeoutRef = useRef<number | null>(null);

  const clearDebounceTimeout = () => {
    if (debounceTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = null;
  };

  const emitChange = (value: string) => {
    if (value.trim() === initialValue.trim()) {
      return;
    }

    onChange(value);
  };

  const scheduleChange = (value: string) => {
    clearDebounceTimeout();

    debounceTimeoutRef.current = window.setTimeout(() => {
      debounceTimeoutRef.current = null;
      emitChange(value);
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    setInputValue(nextValue);
    scheduleChange(nextValue);
  };

  const handleBlur = () => {
    clearDebounceTimeout();
    emitChange(inputValue);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    clearDebounceTimeout();
    emitChange(inputValue);
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
