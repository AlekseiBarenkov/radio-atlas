import { StationCard } from '@entities/station';
import { usePlayerHistory } from '@features/player-history';
import { getVisibleRecentlyPlayedStations } from './lib/get-visible-recently-played-stations';
import { RecentlyPlayedHeader } from './ui';
import S from './recently-played.module.css';

export const RecentlyPlayed = () => {
  const { stations, clear, hasStations } = usePlayerHistory();

  const handleClear = () => {
    clear();
  };

  if (!hasStations) {
    return (
      <section className={S.section}>
        <RecentlyPlayedHeader isClearVisible={false} onClear={handleClear} />
        <div className={S.empty}>Вы пока не запускали ни одной станции</div>
      </section>
    );
  }

  const visibleStations = getVisibleRecentlyPlayedStations(stations);

  return (
    <section className={S.section}>
      <RecentlyPlayedHeader isClearVisible={true} onClear={handleClear} />

      <div className={S.grid}>
        {visibleStations.map((station) => (
          <StationCard key={station.stationuuid} station={station} />
        ))}
      </div>
    </section>
  );
};
