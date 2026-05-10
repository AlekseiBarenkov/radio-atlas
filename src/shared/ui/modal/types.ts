import type { CSSProperties, PropsWithChildren, ReactNode } from 'react';

export type ModalView = 'dialog' | 'drawer';
export type ModalWidth = number | 'auto' | 'full';

export type ModalProps = PropsWithChildren<{
  open: boolean;
  view: ModalView;
  width?: ModalWidth;
  header?: ReactNode;
  footer?: ReactNode;
  closeLabel: string;
  onOpenChange: (open: boolean) => void;
}>;

export type ModalStyle = CSSProperties & {
  '--modal-width'?: string;
};
