import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@app/layout/AppLayout';
import { DiscoverPage } from '@pages/discover/discover-page';
import { FavoritesPage } from '@pages/favorites/favorites-page';
import { HomePage } from '@pages/home/home-page';
import { StationPage } from '@pages/station/station-page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'discover',
        element: <DiscoverPage />,
      },
      {
        path: 'favorites',
        element: <FavoritesPage />,
      },
      {
        path: 'station/:stationId',
        element: <StationPage />,
      },
    ],
  },
]);
