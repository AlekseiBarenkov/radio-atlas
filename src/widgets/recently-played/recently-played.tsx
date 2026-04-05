import { StationCard } from '@entities/station';
import { usePlayerHistory } from '@features/player-history';
import S from './recently-played.module.css';

export const RecentlyPlayed = () => {
  const { stations, clear, hasStations } = usePlayerHistory();

  if (!hasStations) {
    return (
      <section className={S.section}>
        <header className={S.header}>
          <div className={S.titleBlock}>
            <h2 className={S.title}>Recently played</h2>
            <p className={S.description}>Станции, которые вы недавно запускали</p>
          </div>
        </header>

        <div className={S.empty}>Вы пока не запускали ни одной станции</div>
      </section>
    );
  }

  const handleClear = () => {
    clear();
  };

  return (
    <section className={S.section}>
      <header className={S.header}>
        <div className={S.titleBlock}>
          <h2 className={S.title}>Recently played</h2>
          <p className={S.description}>Станции, которые вы недавно запускали</p>
        </div>

        <button className={S.clearButton} type="button" onClick={handleClear}>
          Clear
        </button>
      </header>

      <div className={S.grid}>
        {stations.map((station) => (
          <StationCard key={station.stationuuid} station={station} />
        ))}
      </div>
    </section>
  );
};
