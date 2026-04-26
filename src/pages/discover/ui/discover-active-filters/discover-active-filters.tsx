import { DEFAULT_DISCOVER_FILTERS } from '../../model/discover-filters';
import { useDiscoverContext } from '../../model';
import S from './discover-active-filters.module.css';

type DiscoverActiveFiltersProps = {
  onResetKeyChange: () => void;
};

export const DiscoverActiveFilters = (props: DiscoverActiveFiltersProps) => {
  const { onResetKeyChange } = props;

  const { filters, onCountryChange, onLanguageChange, onTagChange, onHideBrokenChange } = useDiscoverContext();

  const hasActiveFilters =
    filters.country.length > 0 ||
    filters.language.length > 0 ||
    filters.tag.length > 0 ||
    filters.hideBroken !== DEFAULT_DISCOVER_FILTERS.hideBroken;

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className={S.wrapper} aria-label="Active filters">
      {filters.country.length > 0 && (
        <span className={S.chip}>
          Country: {filters.country}
          <button
            className={S.button}
            type="button"
            onClick={() => {
              onCountryChange('');
              onResetKeyChange();
            }}
            aria-label="Remove country filter"
          >
            ×
          </button>
        </span>
      )}

      {filters.language.length > 0 && (
        <span className={S.chip}>
          Language: {filters.language}
          <button
            className={S.button}
            type="button"
            onClick={() => {
              onLanguageChange('');
              onResetKeyChange();
            }}
            aria-label="Remove language filter"
          >
            ×
          </button>
        </span>
      )}

      {filters.tag.length > 0 && (
        <span className={S.chip}>
          Tag: {filters.tag}
          <button
            className={S.button}
            type="button"
            onClick={() => {
              onTagChange('');
              onResetKeyChange();
            }}
            aria-label="Remove tag filter"
          >
            ×
          </button>
        </span>
      )}

      {filters.hideBroken !== DEFAULT_DISCOVER_FILTERS.hideBroken && (
        <span className={S.chip}>
          Broken stations visible
          <button
            className={S.button}
            type="button"
            onClick={() => {
              onHideBrokenChange(DEFAULT_DISCOVER_FILTERS.hideBroken);
              onResetKeyChange();
            }}
            aria-label="Reset hide broken filter"
          >
            ×
          </button>
        </span>
      )}
    </div>
  );
};
