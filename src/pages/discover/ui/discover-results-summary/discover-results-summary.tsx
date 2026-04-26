import { useTranslation } from '@/features/localization';
import { useDiscoverContext } from '../../model';
import { getHasActiveDiscoverFilters } from '../../model/discover-filters';
import S from './discover-results-summary.module.css';

export const DiscoverResultsSummary = () => {
  const { search, filters } = useDiscoverContext();

  const t = useTranslation();

  const hasSearch = search.length > 0;
  const hasFilters = getHasActiveDiscoverFilters(filters);

  if (!hasSearch && !hasFilters) {
    return null;
  }

  const parts: string[] = [];

  if (hasSearch) {
    parts.push(`"${search}"`);
  }

  if (filters.tag.length > 0) {
    parts.push(`${t.discover.tag}: ${filters.tag}`);
  }

  if (filters.country.length > 0) {
    parts.push(`${t.discover.country}: ${filters.country}`);
  }

  if (filters.language.length > 0) {
    parts.push(`${t.discover.language}: ${filters.language}`);
  }

  if (filters.hideBroken === false) {
    parts.push(t.discover.includingBroken);
  }

  return (
    <p className={S.summary}>
      {' '}
      {t.discover.resultsFor} {parts.join(', ')}
    </p>
  );
};
