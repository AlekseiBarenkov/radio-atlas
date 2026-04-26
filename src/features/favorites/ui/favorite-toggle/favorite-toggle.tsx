import type { RadioStation } from '@entities/station';
import { useTranslation } from '@features/localization';
import { useFavorites } from '@features/favorites';
import S from './favorite-toggle.module.css';

type FavoriteToggleProps = {
  station: RadioStation;
};

const getButtonClassName = (isFavorite: boolean): string => {
  return isFavorite ? `${S.button} ${S.buttonActive}` : S.button;
};

export const FavoriteToggle = (props: FavoriteToggleProps) => {
  const { station } = props;

  const t = useTranslation();

  const { isFavorite, toggleFavorite } = useFavorites();

  const isStationFavorite = isFavorite(station.stationuuid);

  const handleClick = () => {
    toggleFavorite(station);
  };

  return (
    <button
      className={getButtonClassName(isStationFavorite)}
      type="button"
      onClick={handleClick}
      aria-pressed={isStationFavorite}
      aria-label={isStationFavorite ? t.favorites.remove : t.favorites.add}
    >
      <span className={S.icon} aria-hidden="true">
        {isStationFavorite ? '★' : '☆'}
      </span>

      <span className={S.label}>{isStationFavorite ? t.favorites.inFavorites : t.favorites.add}</span>
    </button>
  );
};
