import { DiscoverSearchForm } from '../discover-search-form';
import { DiscoverFiltersForm } from '../discover-filters-form/';
import S from './discover-page-filters.module.css';
import { DiscoverActiveFilters } from '../discover-active-filters';
import { useState } from 'react';

export const DiscoverPageFilters = () => {
  const [resetKey, setResetKey] = useState(0);

  const handleResetKeyChange = () => {
    setResetKey((value) => value + 1);
  };

  return (
    <div className={S.controls}>
      <DiscoverSearchForm />
      <DiscoverFiltersForm key={resetKey} onResetKeyChange={handleResetKeyChange} />
      <DiscoverActiveFilters onResetKeyChange={handleResetKeyChange} />
    </div>
  );
};
