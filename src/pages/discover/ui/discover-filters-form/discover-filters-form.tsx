import { useState } from 'react';
import { useDiscoverContext } from '../../model';
import { getHasActiveDiscoverFilters } from '../../model/discover-filters';
import { DiscoverCountryFilter } from '../discover-country-filter';
import { DiscoverLanguageFilter } from '../discover-language-filter';
import S from './discover-filters-form.module.css';

export const DiscoverFiltersForm = () => {
  const { filters, onHideBrokenChange, onResetFilters } = useDiscoverContext();

  const [resetKey, setResetKey] = useState(0);

  const hasActiveFilters = getHasActiveDiscoverFilters(filters);
  const isResetDisabled = !hasActiveFilters;

  const handleReset = () => {
    onResetFilters();
    setResetKey((v) => v + 1);
  };

  return (
    <div className={S.form}>
      <DiscoverCountryFilter key={`country-${resetKey}`} />

      <DiscoverLanguageFilter key={`language-${resetKey}`} />

      <label className={S.checkboxLabel}>
        <input
          className={S.checkbox}
          type="checkbox"
          checked={filters.hideBroken}
          onChange={(event) => onHideBrokenChange(event.target.checked)}
        />
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
