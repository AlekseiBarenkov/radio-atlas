import { type ChangeEvent } from 'react';
import S from './discover-search-form.module.css';

type DiscoverSearchFormProps = {
  value: string;
  onChange: (value: string) => void;
};

export const DiscoverSearchForm = (props: DiscoverSearchFormProps) => {
  const { value, onChange } = props;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
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
        value={value}
        onChange={handleChange}
        placeholder="Search by station name"
        autoComplete="off"
      />
    </form>
  );
};
