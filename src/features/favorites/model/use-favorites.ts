import { useFavoritesStore } from './favorites-store';

type UseFavoritesResult = {
  favoriteStations: ReturnType<typeof useFavoritesStore.getState>['favoriteStations'];
  addFavorite: ReturnType<typeof useFavoritesStore.getState>['actions']['addFavorite'];
  removeFavorite: ReturnType<typeof useFavoritesStore.getState>['actions']['removeFavorite'];
  toggleFavorite: ReturnType<typeof useFavoritesStore.getState>['actions']['toggleFavorite'];
  isFavorite: (stationId: string) => boolean;
};

export const useFavorites = (): UseFavoritesResult => {
  const favoriteStations = useFavoritesStore((state) => state.favoriteStations);
  const addFavorite = useFavoritesStore((state) => state.actions.addFavorite);
  const removeFavorite = useFavoritesStore((state) => state.actions.removeFavorite);
  const toggleFavorite = useFavoritesStore((state) => state.actions.toggleFavorite);

  const isFavorite = (stationId: string) => {
    return favoriteStations.some((station) => station.stationuuid === stationId);
  };

  return {
    favoriteStations,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
};
