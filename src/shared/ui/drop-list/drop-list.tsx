import S from './drop-list.module.css';
import type { DropListProps } from './types';

export const DropList = (props: DropListProps) => {
  const { id, options, activeValue = null, isLoading = false, loadingText, emptyText, onSelect } = props;

  return (
    <div id={id} className={S.list} role="listbox">
      {isLoading ? (
        <div className={S.status}>{loadingText}</div>
      ) : options.length === 0 ? (
        <div className={S.status}>{emptyText}</div>
      ) : (
        options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="option"
            aria-selected={option.value === activeValue}
            data-active={option.value === activeValue || undefined}
            className={S.option}
            onMouseDown={(event) => {
              event.preventDefault();
              onSelect(option.value);
            }}
          >
            <span className={S.primary}>{option.label}</span>
            {option.secondaryLabel && <span className={S.secondary}>{option.secondaryLabel}</span>}
          </button>
        ))
      )}
    </div>
  );
};
