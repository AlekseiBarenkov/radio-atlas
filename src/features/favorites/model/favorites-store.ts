import { create } from 'zustand';
import type { RadioStation } from '@entities/station';
import { loadFavoriteStations, saveFavoriteStations } from './favorites-storage';

type FavoritesState = {
  favoriteStations: RadioStation[];
};

type FavoritesActions = {
  addFavorite: (station: RadioStation) => void;
  removeFavorite: (stationId: string) => void;
  toggleFavorite: (station: RadioStation) => void;
  isFavorite: (stationId: string) => boolean;
};

export type FavoritesStore = FavoritesState & {
  actions: FavoritesActions;
};

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favoriteStations: loadFavoriteStations(),

  actions: {
    addFavorite: (station) => {
      const favoriteStations = get().favoriteStations;
      const isAlreadyFavorite = favoriteStations.some(
        (favoriteStation) => favoriteStation.stationuuid === station.stationuuid,
      );

      if (isAlreadyFavorite) {
        return;
      }

      const nextFavoriteStations = [...favoriteStations, station];

      saveFavoriteStations(nextFavoriteStations);

      set({
        favoriteStations: nextFavoriteStations,
      });
    },

    removeFavorite: (stationId) => {
      const favoriteStations = get().favoriteStations;
      const nextFavoriteStations = favoriteStations.filter((station) => station.stationuuid !== stationId);

      saveFavoriteStations(nextFavoriteStations);

      set({
        favoriteStations: nextFavoriteStations,
      });
    },

    toggleFavorite: (station) => {
      const favoriteStations = get().favoriteStations;
      const isAlreadyFavorite = favoriteStations.some(
        (favoriteStation) => favoriteStation.stationuuid === station.stationuuid,
      );

      if (isAlreadyFavorite) {
        const nextFavoriteStations = favoriteStations.filter(
          (favoriteStation) => favoriteStation.stationuuid !== station.stationuuid,
        );

        saveFavoriteStations(nextFavoriteStations);

        set({
          favoriteStations: nextFavoriteStations,
        });

        return;
      }

      const nextFavoriteStations = [...favoriteStations, station];

      saveFavoriteStations(nextFavoriteStations);

      set({
        favoriteStations: nextFavoriteStations,
      });
    },

    isFavorite: (stationId) => {
      return get().favoriteStations.some((station) => station.stationuuid === stationId);
    },
  },
}));
