import { X } from 'lucide-react';
import { IconButton } from '../icon-button';
import type { ModalProps, ModalStyle } from './types';
import S from './modal.module.css';
import { useCallback, useEffect } from 'react';

const getModalWidth = (width: ModalProps['width']): string | undefined => {
  if (width === undefined) {
    return undefined;
  }

  if (width === 'auto') {
    return 'auto';
  }

  if (width === 'full') {
    return '100%';
  }

  return `${width}px`;
};

export const Modal = (props: ModalProps) => {
  const { open, view, width, header, footer, closeLabel, onOpenChange, children } = props;

  const modalWidth = getModalWidth(width);
  const style: ModalStyle | undefined = modalWidth ? { '--modal-width': modalWidth } : undefined;

  const closeHandler = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    onOpenChange(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeHandler();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeHandler, open]);

  return (
    <div className={S.backdrop} data-state={open ? 'open' : 'closed'} data-view={view} onMouseDown={closeHandler}>
      <section
        className={S.modal}
        role="dialog"
        aria-modal="true"
        inert={!open}
        data-state={open ? 'open' : 'closed'}
        data-view={view}
        style={style}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {header && (
          <header className={S.header}>
            <div className={S.headerContent}>{header}</div>

            <IconButton size="m" aria-label={closeLabel} onClick={closeHandler}>
              <X size={18} />
            </IconButton>
          </header>
        )}

        <div className={S.content}>{children}</div>

        {footer && <footer className={S.footer}>{footer}</footer>}
      </section>
    </div>
  );
};
