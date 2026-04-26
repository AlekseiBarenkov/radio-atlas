import { StationCard, useTopClickStations } from '@entities/station';
import { RecentlyPlayed } from '@widgets/recently-played';
import { Skeleton, SkeletonCard } from '@shared/ui';
import S from './home-page.module.css';
import { Link } from 'react-router-dom';

const SKELETON_ITEMS = 6;

export const HomePage = () => {
  const { stations, isLoading, isError, error } = useTopClickStations({
    limit: 24,
    hideBroken: true,
  });

  if (isLoading) {
    return (
      <section className={S.page}>
        <RecentlyPlayed />

        <header className={S.header}>
          <Skeleton width={280} height={38} />
          <Skeleton width={320} height={20} />
        </header>

        <div className={S.grid}>
          {Array.from({ length: SKELETON_ITEMS }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className={S.page}>
        <RecentlyPlayed />
        <div>Ошибка загрузки: {error?.message ?? 'Unknown error'}</div>
      </section>
    );
  }

  if (stations.length === 0) {
    return (
      <section className={S.page}>
        <RecentlyPlayed />
        <div>Станции не найдены</div>
      </section>
    );
  }

  return (
    <section className={S.page}>
      <header className={S.hero}>
        <p className={S.eyebrow}>Radio Atlas</p>

        <div className={S.heroContent}>
          <h1 className={S.heroTitle}>Listen to radio stations around the world</h1>
          <p className={S.heroDescription}>
            Discover popular online radio, save favorite stations and quickly return to what you played recently.
          </p>
        </div>

        <div className={S.heroBadges} aria-label="Radio Atlas features">
          <span className={S.heroBadge}>Global stations</span>
          <span className={S.heroBadge}>Favorites</span>
          <span className={S.heroBadge}>Recently played</span>
        </div>

        <Link className={S.heroLink} to="/discover">
          Explore stations
        </Link>
      </header>

      <RecentlyPlayed />

      <header className={S.header}>
        <h2 className={S.title}>Top clicked stations</h2>
        <p className={S.description}>Популярные станции из Radio Browser • {stations.length}</p>
      </header>

      <div className={S.grid}>
        {stations.map((station) => (
          <StationCard key={station.stationuuid} station={station} />
        ))}
      </div>
    </section>
  );
};
