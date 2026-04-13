import { useInfiniteQuery } from '@tanstack/react-query';
import { getStations, StationCard } from '@entities/station';
import { SkeletonCard } from '@shared/ui';
import { DiscoverProvider, useDiscoverContext } from './model';
import { DiscoverLoadMoreButton } from './ui/discover-load-more-button';
import { DiscoverPageFilters } from './ui/discover-page-filters';
import { DiscoverPageHeader } from './ui/discover-page-header';
import S from './discover-page.module.css';
import { getHasActiveDiscoverFilters } from './model/discover-filters';

const STATIONS_LIMIT = 48;
const SKELETON_COUNT = 12;

const DiscoverPageContent = () => {
  const { search, filters } = useDiscoverContext();

  const isFilteredMode = search.length > 0 || getHasActiveDiscoverFilters(filters);

  const stationsQuery = useInfiniteQuery({
    queryKey: ['stations', search, filters.country, filters.language, filters.hideBroken, STATIONS_LIMIT],
    queryFn: ({ pageParam, signal }) =>
      getStations(
        {
          name: search,
          country: filters.country,
          language: filters.language,
          hideBroken: filters.hideBroken,
          limit: STATIONS_LIMIT,
          offset: pageParam,
        },
        signal,
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < STATIONS_LIMIT) {
        return undefined;
      }

      return allPages.length * STATIONS_LIMIT;
    },
  });

  const stations = stationsQuery.data?.pages.flat() ?? [];
  const { isPending, isError, error } = stationsQuery;

  const showEmpty = !isPending && !isError && stations.length === 0;
  const showList = !showEmpty && !isPending && !isError;

  return (
    <section className={S.page}>
      <DiscoverPageHeader />

      <DiscoverPageFilters />

      {isPending && (
        <div className={S.grid}>
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      )}

      {isError && <div>Ошибка загрузки: {error?.message ?? 'Unknown error'}</div>}

      {showEmpty && <div>{isFilteredMode ? 'Станции по текущим параметрам не найдены' : 'Станции не найдены'}</div>}

      {showList && (
        <>
          <div className={S.grid}>
            {stations.map((station) => (
              <StationCard key={station.stationuuid} station={station} />
            ))}
          </div>

          {stationsQuery.hasNextPage && (
            <div className={S.loadMore}>
              <DiscoverLoadMoreButton
                onClick={() => {
                  stationsQuery.fetchNextPage();
                }}
                disabled={stationsQuery.isFetchingNextPage}
              />
            </div>
          )}
        </>
      )}
    </section>
  );
};

export const DiscoverPage = () => {
  return (
    <DiscoverProvider>
      <DiscoverPageContent />
    </DiscoverProvider>
  );
};
