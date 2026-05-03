import { useEffect, useRef } from 'react';
import S from './drop-list.module.css';
import type { DropListProps } from './types';

export const DropList = (props: DropListProps) => {
  const { id, options, activeValue = null, isLoading = false, loadingText, emptyText, onSelect } = props;

  const activeOptionRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    activeOptionRef.current?.scrollIntoView({
      block: 'nearest',
    });
  }, [activeValue]);

  return (
    <div id={id} className={S.list} role="listbox">
      {isLoading ? (
        <div className={S.status}>{loadingText}</div>
      ) : options.length === 0 ? (
        <div className={S.status}>{emptyText}</div>
      ) : (
        options.map((option) => {
          const isActive = option.value === activeValue;

          return (
            <button
              key={option.value}
              ref={isActive ? activeOptionRef : undefined}
              type="button"
              role="option"
              aria-selected={isActive}
              data-active={isActive || undefined}
              className={S.option}
              onMouseDown={(event) => {
                event.preventDefault();
                onSelect(option.value);
              }}
            >
              <span className={S.primary}>{option.label}</span>
              {option.secondaryLabel && <span className={S.secondary}>{option.secondaryLabel}</span>}
            </button>
          );
        })
      )}
    </div>
  );
};
