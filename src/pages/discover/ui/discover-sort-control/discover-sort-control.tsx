import { DISCOVER_SORTS, type DiscoverSort } from '../../model/discover-sort';
import { useDiscoverContext } from '../../model';
import S from './discover-sort-control.module.css';
import { useTranslation } from '@/features/localization';
import { Button } from '@/shared/ui';

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

      <div className={S.actions}>
        {sortOptions.map((option) => (
          <Button
            key={option.value}
            variant={sort === option.value ? 'primary' : 'secondary'}
            onClick={() => onSortChange(option.value)}
            aria-pressed={sort === option.value}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
