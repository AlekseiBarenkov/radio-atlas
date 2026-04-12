import { DiscoverFiltersForm } from '@features/discover-filters';
import { DiscoverSearchForm } from '../discover-search-form';
import { useDiscoverPageFilters } from '../../model';
import S from './discover-page-filters.module.css';

type DiscoverPageFiltersProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAppliedFiltersChange: () => void;
};

export const DiscoverPageFilters = (props: DiscoverPageFiltersProps) => {
  const { searchValue, onSearchChange, onAppliedFiltersChange } = props;

  const {
    filters,
    drafts,
    countryOptions,
    languageOptions,
    isCountryOptionsLoading,
    isLanguageOptionsLoading,
    handleCountryChange,
    handleLanguageChange,
    handleCountrySelect,
    handleLanguageSelect,
    handleHideBrokenChange,
    handleResetFilters,
  } = useDiscoverPageFilters({
    onAppliedFiltersChange,
  });

  return (
    <div className={S.controls}>
      <DiscoverSearchForm value={searchValue} onChange={onSearchChange} />

      <DiscoverFiltersForm
        filters={filters}
        drafts={drafts}
        countryOptions={countryOptions}
        languageOptions={languageOptions}
        isCountryOptionsLoading={isCountryOptionsLoading}
        isLanguageOptionsLoading={isLanguageOptionsLoading}
        onCountryChange={handleCountryChange}
        onLanguageChange={handleLanguageChange}
        onCountrySelect={handleCountrySelect}
        onLanguageSelect={handleLanguageSelect}
        onHideBrokenChange={handleHideBrokenChange}
        onReset={handleResetFilters}
      />
    </div>
  );
};
