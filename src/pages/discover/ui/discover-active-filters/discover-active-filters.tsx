import { DEFAULT_DISCOVER_FILTERS } from '../../model/discover-filters';
import { useDiscoverContext } from '../../model';
import S from './discover-active-filters.module.css';
import { useTranslation } from '@/features/localization';
import { IconButton } from '@/shared/ui';

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
        <span className={S.chip}>
          <span>
            {t.discover.country}: {filters.country}
          </span>

          <IconButton
            onClick={() => {
              onCountryChange('');
              onResetKeyChange();
            }}
            aria-label={t.discover.removeCountryFilter}
          >
            ×
          </IconButton>
        </span>
      )}

      {filters.language.length > 0 && (
        <span className={S.chip}>
          <span>
            {t.discover.language}: {filters.language}
          </span>

          <IconButton
            onClick={() => {
              onLanguageChange('');
              onResetKeyChange();
            }}
            aria-label={t.discover.removeLanguageFilter}
          >
            ×
          </IconButton>
        </span>
      )}

      {filters.tag.length > 0 && (
        <span className={S.chip}>
          <span>
            {t.discover.tag}: {filters.tag}
          </span>

          <IconButton
            onClick={() => {
              onTagChange('');
              onResetKeyChange();
            }}
            aria-label={t.discover.removeTagFilter}
          >
            ×
          </IconButton>
        </span>
      )}

      {filters.hideBroken !== DEFAULT_DISCOVER_FILTERS.hideBroken && (
        <span className={S.chip}>
          <span>{t.discover.brokenStationsVisible}</span>

          <IconButton
            onClick={() => {
              onHideBrokenChange(DEFAULT_DISCOVER_FILTERS.hideBroken);
              onResetKeyChange();
            }}
            aria-label={t.discover.resetHideBrokenFilter}
          >
            ×
          </IconButton>
        </span>
      )}
    </div>
  );
};
