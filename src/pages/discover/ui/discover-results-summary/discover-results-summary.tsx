import { useDiscoverContext } from '../../model';
import { getHasActiveDiscoverFilters } from '../../model/discover-filters';
import S from './discover-results-summary.module.css';

export const DiscoverResultsSummary = () => {
  const { search, filters } = useDiscoverContext();

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
    parts.push(`tag: ${filters.tag}`);
  }

  if (filters.country.length > 0) {
    parts.push(`country: ${filters.country}`);
  }

  if (filters.language.length > 0) {
    parts.push(`language: ${filters.language}`);
  }

  if (filters.hideBroken === false) {
    parts.push('including broken');
  }

  return <p className={S.summary}>Results for {parts.join(', ')}</p>;
};
