import { IconButton } from '@/shared/ui';
import { X } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import S from './discover-active-filters.module.css';

type DiscoverActiveFiltersChipProps = PropsWithChildren<{
  onClose: () => void;
  ariaLabel: string;
}>;

const DiscoverActiveFiltersChip = (props: DiscoverActiveFiltersChipProps) => {
  const { children, onClose, ariaLabel } = props;

  return (
    <span className={S.chip}>
      <span className={S.label}>{children}</span>

      <IconButton onClick={onClose} aria-label={ariaLabel}>
        <X size={14} aria-hidden="true" />
      </IconButton>
    </span>
  );
};

export default DiscoverActiveFiltersChip;
