import { DiscoverSearchForm } from '../discover-search-form';
import { DiscoverFiltersForm } from '../discover-filters-form/';
import S from './discover-page-filters.module.css';

export const DiscoverPageFilters = () => {
  return (
    <div className={S.controls}>
      <DiscoverSearchForm />
      <DiscoverFiltersForm />
    </div>
  );
};
