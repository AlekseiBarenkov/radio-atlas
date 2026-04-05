import { type ChangeEvent } from 'react';
import S from './discover-filters.module.css';

type DiscoverFiltersProps = {
  hideBroken: boolean;
  onHideBrokenChange: (value: boolean) => void;
};

export const DiscoverFilters = (props: DiscoverFiltersProps) => {
  const { hideBroken, onHideBrokenChange } = props;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onHideBrokenChange(event.target.checked);
  };

  return (
    <div className={S.filters}>
      <label className={S.checkboxLabel}>
        <input className={S.checkbox} type="checkbox" checked={hideBroken} onChange={handleChange} />
        Hide broken stations
      </label>
    </div>
  );
};
