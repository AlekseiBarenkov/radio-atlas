import type { ReactNode } from 'react';

export type DropPlacement = 'bottom-start' | 'bottom-end';
export type DropWidth = 'trigger' | 'auto';

export type DropProps = {
  trigger: ReactNode;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  placement?: DropPlacement;
  width?: DropWidth;
  className?: string;
  contentClassName?: string;
  onOpenChange?: (open: boolean) => void;
};
