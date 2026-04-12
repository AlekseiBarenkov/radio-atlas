import { type ChangeEvent, useEffect, useState } from 'react';
import { useDebouncedValue } from '@shared/hooks';
import S from './discover-search-form.module.css';

type DiscoverSearchFormProps = {
  initialValue: string;
  onChange: (value: string) => void;
};

const SEARCH_DEBOUNCE_MS = 400;

export const DiscoverSearchForm = (props: DiscoverSearchFormProps) => {
  const { initialValue, onChange } = props;

  const [inputValue, setInputValue] = useState(initialValue);
  const debouncedValue = useDebouncedValue(inputValue, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (debouncedValue === initialValue) {
      return;
    }

    onChange(debouncedValue);
  }, [debouncedValue, initialValue, onChange]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
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
        placeholder="Search by station name"
        autoComplete="off"
      />
    </form>
  );
};
