import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getStations, StationCard } from '@entities/station';
import { getDiscoverFiltersFromSearchParams, getHasActiveDiscoverFilters } from '@features/discover-filters';
import { SkeletonCard } from '@shared/ui';
import { DiscoverLoadMoreButton } from './ui/discover-load-more-button';
import { DiscoverPageFilters } from './ui/discover-page-filters';
import { DiscoverPageHeader } from './ui/discover-page-header';
import S from './discover-page.module.css';

const STATIONS_LIMIT = 48;
const SKELETON_COUNT = 12;

export const DiscoverPage = () => {
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState('');

  const filters = getDiscoverFiltersFromSearchParams(searchParams);
  const normalizedSearchValue = searchValue.trim();
  const searchParamsStateKey = searchParams.toString();

  const hasActiveFilters = getHasActiveDiscoverFilters(filters);
  const isFilteredMode = normalizedSearchValue.length > 0 || hasActiveFilters;

  const stationsQuery = useInfiniteQuery({
    queryKey: [
      'stations',
      normalizedSearchValue,
      filters.country,
      filters.language,
      filters.hideBroken,
      STATIONS_LIMIT,
    ] as const,
    queryFn: ({ pageParam, signal }) =>
      getStations(
        {
          name: normalizedSearchValue,
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

  const isLoadMoreVisible = stationsQuery.hasNextPage;
  const isLoadMoreDisabled = stationsQuery.isFetchingNextPage;

  const handleLoadMore = () => {
    stationsQuery.fetchNextPage();
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const showEmpty = !isPending && !isError && stations.length === 0;
  const showList = !showEmpty && !isPending && !isError;

  return (
    <section className={S.page}>
      <DiscoverPageHeader />

      <DiscoverPageFilters
        key={searchParamsStateKey}
        initialFilters={filters}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
      />

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

          {isLoadMoreVisible && (
            <div className={S.loadMore}>
              <DiscoverLoadMoreButton onClick={handleLoadMore} disabled={isLoadMoreDisabled} />
            </div>
          )}
        </>
      )}
    </section>
  );
};
