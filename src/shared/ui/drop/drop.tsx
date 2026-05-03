import { type FocusEvent, type KeyboardEvent, useState } from 'react';
import S from './drop.module.css';
import type { DropProps } from './types';

export const Drop = (props: DropProps) => {
  const {
    trigger,
    children,
    open,
    defaultOpen = false,
    placement = 'bottom-start',
    width = 'trigger',
    className = '',
    contentClassName = '',
    onOpenChange,
  } = props;

  const [innerOpen, setInnerOpen] = useState(defaultOpen);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : innerOpen;

  const setOpen = (nextOpen: boolean) => {
    if (!isControlled) {
      setInnerOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }

    setOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape') {
      return;
    }

    setOpen(false);
  };

  return (
    <div className={[S.drop, className].filter(Boolean).join(' ')} onBlur={handleBlur} onKeyDown={handleKeyDown}>
      {trigger}

      {isOpen && (
        <div
          className={[S.content, contentClassName].filter(Boolean).join(' ')}
          data-placement={placement}
          data-width={width}
        >
          {children}
        </div>
      )}
    </div>
  );
};
