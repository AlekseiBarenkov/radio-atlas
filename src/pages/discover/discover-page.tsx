import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { getStations, useSearchStations, StationCard } from '@entities/station';
import { getDiscoverFiltersFromSearchParams, getHasActiveDiscoverFilters } from '@features/discover-filters';
import { useDebouncedValue } from '@shared/hooks';
import { Skeleton, SkeletonCard } from '@shared/ui';
import { mergeStations } from './lib';
import { DiscoverLoadMoreButton } from './ui/discover-load-more-button';
import { DiscoverPageFilters } from './ui/discover-page-filters';
import { DiscoverPageHeader } from './ui/discover-page-header';
import S from './discover-page.module.css';

const STATIONS_LIMIT = 48;
const SKELETON_COUNT = 12;
const SEARCH_DEBOUNCE_MS = 400;

export const DiscoverPage = () => {
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState('');
  const [pageOffsets, setPageOffsets] = useState<number[]>([0]);

  const filters = useMemo(() => {
    return getDiscoverFiltersFromSearchParams(searchParams);
  }, [searchParams]);

  const debouncedSearchValue = useDebouncedValue(searchValue, SEARCH_DEBOUNCE_MS);
  const debouncedFilters = useDebouncedValue(filters, SEARCH_DEBOUNCE_MS);

  const normalizedSearchValue = debouncedSearchValue.trim();
  const isSearchMode = normalizedSearchValue.length > 0;
  const hasActiveFilters = getHasActiveDiscoverFilters(filters);
  const isFilteredMode = isSearchMode || hasActiveFilters;
  const searchParamsStateKey = searchParams.toString();

  const stationsQueries = useQueries({
    queries: pageOffsets.map((offset) => ({
      queryKey: [
        'stations',
        offset,
        STATIONS_LIMIT,
        debouncedFilters.hideBroken,
        debouncedFilters.country,
        debouncedFilters.language,
      ] as const,
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        getStations(
          {
            limit: STATIONS_LIMIT,
            offset,
            hideBroken: debouncedFilters.hideBroken,
            country: debouncedFilters.country,
            language: debouncedFilters.language,
          },
          signal,
        ),
      enabled: !isSearchMode,
    })),
  });

  const searchQuery = useSearchStations({
    name: normalizedSearchValue,
    country: filters.country,
    language: filters.language,
    limit: STATIONS_LIMIT,
    hideBroken: filters.hideBroken,
  });

  const stations = useMemo(() => {
    if (isSearchMode) {
      return searchQuery.data ?? [];
    }

    return mergeStations(stationsQueries.map((query) => query.data ?? []));
  }, [isSearchMode, searchQuery.data, stationsQueries]);

  const isInitialStationsPending =
    !isSearchMode && stationsQueries.some((query) => query.isPending) && stations.length === 0;
  const isStationsError = !isSearchMode && stationsQueries.some((query) => query.isError) && stations.length === 0;
  const stationsError = !isSearchMode ? (stationsQueries.find((query) => query.error)?.error ?? null) : null;

  const activeIsPending = isSearchMode ? searchQuery.isPending : isInitialStationsPending;
  const activeIsError = isSearchMode ? searchQuery.isError : isStationsError;
  const activeError = isSearchMode ? (searchQuery.error ?? null) : stationsError;

  const lastStationsQuery = isSearchMode ? null : stationsQueries[stationsQueries.length - 1];
  const lastStationsPage = lastStationsQuery?.data ?? [];

  const isLoadMoreVisible = !isSearchMode && lastStationsPage.length === STATIONS_LIMIT;
  const isLoadMoreDisabled = !isSearchMode && stationsQueries.some((query) => query.isPending);

  const resetPagination = () => {
    setPageOffsets([0]);
  };

  const handleLoadMore = () => {
    const nextOffset = pageOffsets[pageOffsets.length - 1] + STATIONS_LIMIT;

    setPageOffsets((prev) => [...prev, nextOffset]);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    resetPagination();
  };

  const showEmpty = !activeIsPending && !activeIsError && stations.length === 0;
  const showList = !showEmpty && !activeIsPending && !activeIsError;

  return (
    <section className={S.page}>
      {activeIsPending ? (
        <header>
          <Skeleton width={180} height={38} />
          <Skeleton width={320} height={20} />
        </header>
      ) : (
        <DiscoverPageHeader />
      )}

      <DiscoverPageFilters
        key={searchParamsStateKey}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onAppliedFiltersChange={resetPagination}
      />

      {activeIsPending && (
        <div className={S.grid}>
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      )}

      {activeIsError && <div>Ошибка загрузки: {activeError?.message ?? 'Unknown error'}</div>}

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
