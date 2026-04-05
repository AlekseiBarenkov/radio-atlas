import { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { getStations, StationCard, useSearchStations, type RadioStation } from '@entities/station';
import { useDebouncedValue } from '@shared/hooks';
import { Skeleton, SkeletonCard } from '@shared/ui';
import { DiscoverFilters } from './ui/discover-filters';
import { DiscoverLoadMoreButton } from './ui/discover-load-more-button';
import { DiscoverSearchForm } from './ui/discover-search-form';
import { DiscoverPageHeader } from './ui/discover-page-header';
import S from './discover-page.module.css';

const STATIONS_LIMIT = 48;
const SKELETON_COUNT = 12;
const SEARCH_DEBOUNCE_MS = 400;

const mergeStations = (stationPages: RadioStation[][]): RadioStation[] => {
  const stationMap = new Map<string, RadioStation>();

  stationPages.forEach((page) => {
    page.forEach((station) => {
      stationMap.set(station.stationuuid, station);
    });
  });

  return Array.from(stationMap.values());
};

export const DiscoverPage = () => {
  const [searchValue, setSearchValue] = useState('');
  const [hideBroken, setHideBroken] = useState(true);
  const [pageOffsets, setPageOffsets] = useState<number[]>([0]);

  const debouncedSearchValue = useDebouncedValue(searchValue, SEARCH_DEBOUNCE_MS);
  const normalizedSearchValue = debouncedSearchValue.trim();
  const isSearchMode = normalizedSearchValue.length > 0;

  const stationsQueries = useQueries({
    queries: pageOffsets.map((offset) => ({
      queryKey: ['stations', offset, STATIONS_LIMIT, hideBroken] as const,
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        getStations(
          {
            limit: STATIONS_LIMIT,
            offset,
            hideBroken,
          },
          signal,
        ),
      enabled: !isSearchMode,
    })),
  });

  const searchQuery = useSearchStations({
    name: normalizedSearchValue,
    limit: STATIONS_LIMIT,
    hideBroken,
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

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setPageOffsets([0]);
  };

  const handleHideBrokenChange = (value: boolean) => {
    setHideBroken(value);
    setPageOffsets([0]);
  };

  const handleLoadMore = () => {
    setPageOffsets((currentOffsets) => {
      const nextOffset = currentOffsets.length * STATIONS_LIMIT;

      if (currentOffsets.includes(nextOffset)) {
        return currentOffsets;
      }

      return [...currentOffsets, nextOffset];
    });
  };

  if (activeIsPending) {
    return (
      <section className={S.page}>
        <header className={S.header}>
          <Skeleton width={180} height={38} />
          <Skeleton width={320} height={20} />
        </header>

        <div className={S.controls}>
          <DiscoverSearchForm value={searchValue} onChange={handleSearchChange} />
          <DiscoverFilters hideBroken={hideBroken} onHideBrokenChange={handleHideBrokenChange} />
        </div>

        <div className={S.grid}>
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </section>
    );
  }

  if (activeIsError) {
    return (
      <section className={S.page}>
        <DiscoverPageHeader />

        <div className={S.controls}>
          <DiscoverSearchForm value={searchValue} onChange={handleSearchChange} />
          <DiscoverFilters hideBroken={hideBroken} onHideBrokenChange={handleHideBrokenChange} />
        </div>

        <div>Ошибка загрузки: {activeError?.message ?? 'Unknown error'}</div>
      </section>
    );
  }

  if (stations.length === 0) {
    return (
      <section className={S.page}>
        <DiscoverPageHeader />

        <div className={S.controls}>
          <DiscoverSearchForm value={searchValue} onChange={handleSearchChange} />
          <DiscoverFilters hideBroken={hideBroken} onHideBrokenChange={handleHideBrokenChange} />
        </div>

        <div>{isSearchMode ? 'По вашему запросу станции не найдены' : 'Станции не найдены'}</div>
      </section>
    );
  }

  return (
    <section className={S.page}>
      <DiscoverPageHeader />

      <div className={S.controls}>
        <DiscoverSearchForm value={searchValue} onChange={handleSearchChange} />
        <DiscoverFilters hideBroken={hideBroken} onHideBrokenChange={handleHideBrokenChange} />
      </div>

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
    </section>
  );
};
