import { type ChangeEvent } from 'react';
import type { DiscoverFiltersState } from '../../model';
import { getHasActiveDiscoverFilters } from '../../model';
import S from './discover-filters-form.module.css';

type DiscoverFiltersFormProps = {
  filters: DiscoverFiltersState;
  onCountryChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onHideBrokenChange: (value: boolean) => void;
  onReset: () => void;
};

export const DiscoverFiltersForm = (props: DiscoverFiltersFormProps) => {
  const { filters, onCountryChange, onLanguageChange, onHideBrokenChange, onReset } = props;

  const hasActiveFilters = getHasActiveDiscoverFilters(filters);

  const handleCountryChange = (event: ChangeEvent<HTMLInputElement>) => {
    onCountryChange(event.target.value);
  };

  const handleLanguageChange = (event: ChangeEvent<HTMLInputElement>) => {
    onLanguageChange(event.target.value);
  };

  const handleHideBrokenChange = (event: ChangeEvent<HTMLInputElement>) => {
    onHideBrokenChange(event.target.checked);
  };

  return (
    <div className={S.form}>
      <div className={S.field}>
        <label className={S.label} htmlFor="discover-filter-country">
          Country
        </label>

        <input
          id="discover-filter-country"
          name="discover-filter-country"
          type="text"
          className={S.input}
          value={filters.country}
          onChange={handleCountryChange}
          placeholder="For example: Germany"
          autoComplete="off"
        />
      </div>

      <div className={S.field}>
        <label className={S.label} htmlFor="discover-filter-language">
          Language
        </label>

        <input
          id="discover-filter-language"
          name="discover-filter-language"
          type="text"
          className={S.input}
          value={filters.language}
          onChange={handleLanguageChange}
          placeholder="For example: English"
          autoComplete="off"
        />
      </div>

      <label className={S.checkboxLabel}>
        <input className={S.checkbox} type="checkbox" checked={filters.hideBroken} onChange={handleHideBrokenChange} />
        Hide broken stations
      </label>

      <div className={S.actions}>
        <button className={S.resetButton} type="button" onClick={onReset} disabled={!hasActiveFilters}>
          Clear filters
        </button>
      </div>
    </div>
  );
};
