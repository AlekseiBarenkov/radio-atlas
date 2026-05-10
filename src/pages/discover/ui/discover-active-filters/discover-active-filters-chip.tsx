import { IconButton } from '@/shared/ui';
import type { PropsWithChildren } from 'react';
import { X } from 'lucide-react';
import S from './discover-active-filters.module.css';

type DiscoverActiveFiltersChipProps = PropsWithChildren<{
  onCLose: () => void;
  ariaLabel: string;
}>;

const DiscoverActiveFiltersChip = (props: DiscoverActiveFiltersChipProps) => {
  const { children, onCLose, ariaLabel } = props;

  return (
    <span className={S.chip}>
      <span className={S.label}>{children}</span>

      <IconButton onClick={onCLose} aria-label={ariaLabel}>
        <X size={14} aria-hidden="true" />
      </IconButton>
    </span>
  );
};

export default DiscoverActiveFiltersChip;
