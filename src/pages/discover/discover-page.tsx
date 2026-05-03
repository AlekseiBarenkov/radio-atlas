import { useInfiniteQuery } from '@tanstack/react-query';
import { getStations, StationCard } from '@entities/station';
import { Notice, PageHeader, PageShell, SkeletonCard } from '@shared/ui';
import { DiscoverProvider, useDiscoverContext } from './model';
import { DiscoverPageFilters } from './ui/discover-page-filters';
import S from './discover-page.module.css';
import { getHasActiveDiscoverFilters } from './model/discover-filters';
import { mapDiscoverSortToStationsParams } from './model/discover-sort';
import { DiscoverResultsSummary } from './ui/discover-results-summary';
import { DiscoverInfiniteScrollTrigger } from './ui/discover-infinite-scroll-trigger';
import { useTranslation } from '@/features/localization';

const STATIONS_LIMIT = 48;
const SKELETON_COUNT = 12;

const DISCOVER_STATIONS_STALE_TIME = 1000 * 60 * 30;
const DISCOVER_STATIONS_GC_TIME = 1000 * 60 * 60;

const DiscoverPageContent = () => {
  const { search, filters, sort } = useDiscoverContext();

  const t = useTranslation();

  const isFilteredMode = search.length > 0 || getHasActiveDiscoverFilters(filters);
  const sortParams = mapDiscoverSortToStationsParams(sort);

  const stationsQuery = useInfiniteQuery({
    queryKey: [
      'stations',
      search,
      filters.country,
      filters.language,
      filters.tag,
      filters.hideBroken,
      sort,
      STATIONS_LIMIT,
    ],
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
          order: sortParams.order,
          reverse: sortParams.reverse,
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
  const { isPending, isFetchingNextPage, isError, error, hasNextPage } = stationsQuery;

  const showEmpty = !isPending && !isError && stations.length === 0;
  const showList = !showEmpty && !isPending && !isError;
  const isInfiniteScrollEnabled = Boolean(hasNextPage) && !isFetchingNextPage && !isPending;

  return (
    <PageShell>
      <PageHeader title={t.discover.title} description={t.discover.description} />

      <DiscoverPageFilters />

      <DiscoverResultsSummary />

      {isPending && (
        <div className={S.grid}>
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      )}

      {isError && (
        <Notice tone="error" title={`${t.discover.loadingError}: ${error?.message ?? t.common.unknownError}`} />
      )}

      {showEmpty && <Notice title={isFilteredMode ? t.discover.emptyFiltered : t.discover.emptyDefault} />}

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
    </PageShell>
  );
};

export const DiscoverPage = () => {
  return (
    <DiscoverProvider>
      <DiscoverPageContent />
    </DiscoverProvider>
  );
};
