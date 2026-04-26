import { useInfiniteQuery } from '@tanstack/react-query';
import { getStations, StationCard } from '@entities/station';
import { SkeletonCard } from '@shared/ui';
import { DiscoverProvider, useDiscoverContext } from './model';
import { DiscoverPageFilters } from './ui/discover-page-filters';
import { DiscoverPageHeader } from './ui/discover-page-header';
import S from './discover-page.module.css';
import { getHasActiveDiscoverFilters } from './model/discover-filters';
import { DiscoverResultsSummary } from './ui/discover-results-summary';
import { DiscoverInfiniteScrollTrigger } from './ui/discover-infinite-scroll-trigger';

const STATIONS_LIMIT = 48;
const SKELETON_COUNT = 12;

const DISCOVER_STATIONS_STALE_TIME = 1000 * 60 * 30;
const DISCOVER_STATIONS_GC_TIME = 1000 * 60 * 60;

const DiscoverPageContent = () => {
  const { search, filters } = useDiscoverContext();

  const isFilteredMode = search.length > 0 || getHasActiveDiscoverFilters(filters);

  const stationsQuery = useInfiniteQuery({
    queryKey: ['stations', search, filters.country, filters.language, filters.tag, filters.hideBroken, STATIONS_LIMIT],
    queryFn: ({ pageParam, signal }) =>
      getStations(
        {
          name: search,
          country: filters.country,
          language: filters.language,
          tag: filters.tag,
          hideBroken: filters.hideBroken,
          limit: STATIONS_LIMIT,
          offset: pageParam,
          order: search.length > 0 ? 'name' : undefined,
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
    staleTime: DISCOVER_STATIONS_STALE_TIME,
    gcTime: DISCOVER_STATIONS_GC_TIME,
  });

  const stations = stationsQuery.data?.pages.flat() ?? [];
  const { isPending, isFetching, isFetchingNextPage, isError, error, hasNextPage } = stationsQuery;

  const showEmpty = !isPending && !isError && stations.length === 0;
  const showList = !showEmpty && !isPending && !isError;
  const isInfiniteScrollEnabled = Boolean(hasNextPage) && !isFetchingNextPage && !isPending;
  const isSearching = search.length > 0 && isFetching && !isFetchingNextPage;

  return (
    <section className={S.page}>
      <DiscoverPageHeader />

      <DiscoverPageFilters />

      <DiscoverResultsSummary />

      {isSearching && <div className={S.searchStatus}>Searching...</div>}

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
              <StationCard key={station.stationuuid} station={station} searchQuery={search} />
            ))}
          </div>

          {stationsQuery.isFetchingNextPage && (
            <div className={S.grid}>
              {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <SkeletonCard key={`load-more-skeleton-${index}`} />
              ))}
            </div>
          )}

          <DiscoverInfiniteScrollTrigger
            isEnabled={isInfiniteScrollEnabled}
            onLoadMore={() => {
              stationsQuery.fetchNextPage();
            }}
          />
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
