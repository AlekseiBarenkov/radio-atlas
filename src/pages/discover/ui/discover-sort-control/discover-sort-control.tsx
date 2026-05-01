import { DISCOVER_SORTS, type DiscoverSort } from '../../model/discover-sort';
import { useDiscoverContext } from '../../model';
import S from './discover-sort-control.module.css';
import { useTranslation } from '@/features/localization';
import { ToggleGroup } from '@/shared/ui';

type SortOption = {
  value: DiscoverSort;
  label: string;
};

export const DiscoverSortControl = () => {
  const { sort, onSortChange } = useDiscoverContext();

  const t = useTranslation();

  const sortOptions: SortOption[] = [
    {
      value: DISCOVER_SORTS.POPULAR,
      label: t.discover.sortPopular,
    },
    {
      value: DISCOVER_SORTS.TRENDING,
      label: t.discover.sortTrending,
    },
    {
      value: DISCOVER_SORTS.NAME,
      label: t.discover.sortName,
    },
  ];

  return (
    <div className={S.wrapper}>
      <span className={S.label}>{t.discover.sortBy}</span>

      <ToggleGroup label={t.discover.sortBy} value={sort} options={sortOptions} width="auto" onChange={onSortChange} />
    </div>
  );
};
