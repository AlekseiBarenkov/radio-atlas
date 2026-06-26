import { useState } from 'react';
import { DiscoverActiveFilters } from '../discover-active-filters';
import { DiscoverFiltersForm } from '../discover-filters-form/';
import { DiscoverSearch } from '../discover-search';
import S from './discover-page-filters.module.css';

export const DiscoverPageFilters = () => {
  const [resetKey, setResetKey] = useState(0);

  const handleResetKeyChange = () => {
    setResetKey((value) => value + 1);
  };

  return (
    <div className={S.controls}>
      <DiscoverSearch />
      <DiscoverFiltersForm key={resetKey} onResetKeyChange={handleResetKeyChange} />
      <DiscoverActiveFilters onResetKeyChange={handleResetKeyChange} />
    </div>
  );
};
