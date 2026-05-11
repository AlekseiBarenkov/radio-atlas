import type { RadioStation } from '@entities/station';
import { useTranslation } from '@features/localization';
import { useFavorites } from '@features/favorites';
import { IconButton } from '@/shared/ui';
import { useToastActions } from '@/features/toast';
import { Star } from 'lucide-react';
import S from './favorite-toggle.module.css';

type FavoriteToggleProps = {
  station: RadioStation;
};

export const FavoriteToggle = (props: FavoriteToggleProps) => {
  const { station } = props;

  const t = useTranslation();
  const { showToast } = useToastActions();

  const { isFavorite, toggleFavorite } = useFavorites();

  const isStationFavorite = isFavorite(station.stationuuid);

  const handleClick = () => {
    toggleFavorite(station);

    showToast({
      tone: isStationFavorite ? 'info' : 'success',
      title: isStationFavorite ? t.favorites.removedToast : t.favorites.addedToast,
      description: station.name,
    });
  };

  return (
    <IconButton
      size="m"
      className={isStationFavorite ? S.active : ''}
      onClick={handleClick}
      aria-pressed={isStationFavorite}
      aria-label={isStationFavorite ? t.favorites.remove : t.favorites.add}
    >
      <Star size={17} fill={isStationFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
    </IconButton>
  );
};
