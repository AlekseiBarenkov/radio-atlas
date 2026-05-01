import S from './toggle-group.module.css';

type ToggleGroupOption<TValue extends string> = {
  value: TValue;
  label: string;
};

type ToggleGroupWidth = 'auto' | 'full';

type ToggleGroupProps<TValue extends string> = {
  label: string;
  value: TValue;
  options: ToggleGroupOption<TValue>[];
  width?: ToggleGroupWidth;
  onChange: (value: TValue) => void;
};

export const ToggleGroup = <TValue extends string>(props: ToggleGroupProps<TValue>) => {
  const { label, value, options, width = 'full', onChange } = props;

  return (
    <div className={S.group} data-width={width} aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          className={S.button}
          type="button"
          data-active={value === option.value || undefined}
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
