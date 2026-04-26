import { useDiscoverContext } from '../../model';
import { getHasActiveDiscoverFilters } from '../../model/discover-filters';
import { DiscoverCountryFilter } from '../discover-country-filter';
import { DiscoverLanguageFilter } from '../discover-language-filter';
import S from './discover-filters-form.module.css';
import { DiscoverTagFilter } from '../discover-tag-filter';
import { useTranslation } from '@/features/localization';
import { Button } from '@/shared/ui';

type DiscoverFiltersFormProps = {
  onResetKeyChange: () => void;
};

export const DiscoverFiltersForm = (props: DiscoverFiltersFormProps) => {
  const { onResetKeyChange } = props;

  const { filters, onHideBrokenChange, onResetFilters } = useDiscoverContext();

  const t = useTranslation();

  const hasActiveFilters = getHasActiveDiscoverFilters(filters);
  const isResetDisabled = !hasActiveFilters;

  const handleReset = () => {
    onResetFilters();
    onResetKeyChange();
  };

  return (
    <div className={S.form}>
      <DiscoverCountryFilter />

      <DiscoverLanguageFilter />

      <DiscoverTagFilter />

      <label className={S.checkboxLabel}>
        <input
          className={S.checkbox}
          type="checkbox"
          checked={filters.hideBroken}
          onChange={(event) => onHideBrokenChange(event.target.checked)}
        />
        {t.discover.hideBroken}
      </label>

      <div className={S.actions}>
        <Button variant="secondary" onClick={handleReset} disabled={isResetDisabled}>
          {t.discover.clearFilters}
        </Button>
      </div>
    </div>
  );
};
