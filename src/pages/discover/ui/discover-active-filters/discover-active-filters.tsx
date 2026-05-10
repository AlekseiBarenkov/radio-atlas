import { useTranslation } from '@/features/localization';
import { useDiscoverContext } from '../../model';
import { DEFAULT_DISCOVER_FILTERS } from '../../model/discover-filters';
import DiscoverActiveFiltersChip from './discover-active-filters-chip';
import S from './discover-active-filters.module.css';

type DiscoverActiveFiltersProps = {
  onResetKeyChange: () => void;
};

export const DiscoverActiveFilters = (props: DiscoverActiveFiltersProps) => {
  const { onResetKeyChange } = props;

  const { filters, onCountryChange, onLanguageChange, onTagChange, onHideBrokenChange } = useDiscoverContext();

  const t = useTranslation();

  const hasActiveFilters =
    filters.country.length > 0 ||
    filters.language.length > 0 ||
    filters.tag.length > 0 ||
    filters.hideBroken !== DEFAULT_DISCOVER_FILTERS.hideBroken;

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className={S.wrapper} aria-label={t.discover.activeFiltersAriaLabel}>
      {filters.country.length > 0 && (
        <DiscoverActiveFiltersChip
          onClose={() => {
            onCountryChange('');
            onResetKeyChange();
          }}
          ariaLabel={t.discover.removeCountryFilter}
        >
          {t.discover.country}: {filters.country}
        </DiscoverActiveFiltersChip>
      )}

      {filters.language.length > 0 && (
        <DiscoverActiveFiltersChip
          onClose={() => {
            onLanguageChange('');
            onResetKeyChange();
          }}
          ariaLabel={t.discover.removeLanguageFilter}
        >
          {t.discover.language}: {filters.language}
        </DiscoverActiveFiltersChip>
      )}

      {filters.tag.length > 0 && (
        <DiscoverActiveFiltersChip
          onClose={() => {
            onTagChange('');
            onResetKeyChange();
          }}
          ariaLabel={t.discover.removeTagFilter}
        >
          {t.discover.tag}: {filters.tag}
        </DiscoverActiveFiltersChip>
      )}

      {filters.hideBroken !== DEFAULT_DISCOVER_FILTERS.hideBroken && (
        <DiscoverActiveFiltersChip
          onClose={() => {
            onHideBrokenChange(DEFAULT_DISCOVER_FILTERS.hideBroken);
            onResetKeyChange();
          }}
          ariaLabel={t.discover.resetHideBrokenFilter}
        >
          {t.discover.brokenStationsVisible}
        </DiscoverActiveFiltersChip>
      )}
    </div>
  );
};
