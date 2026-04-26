import { StationCard, useTopClickStations } from '@entities/station';
import { RecentlyPlayed } from '@widgets/recently-played';
import { Skeleton, SkeletonCard } from '@shared/ui';
import S from './home-page.module.css';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/features/localization';

const SKELETON_ITEMS = 6;

export const HomePage = () => {
  const t = useTranslation();

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
        <div>
          {t.home.loadingError}: {error?.message ?? t.common.unknownError}
        </div>
      </section>
    );
  }

  if (stations.length === 0) {
    return (
      <section className={S.page}>
        <RecentlyPlayed />
        <div>{t.home.stationsNotFound}</div>
      </section>
    );
  }

  return (
    <section className={S.page}>
      <header className={S.hero}>
        <p className={S.eyebrow}>{t.home.eyebrow}</p>

        <div className={S.heroContent}>
          <h1 className={S.heroTitle}>{t.home.heroTitle}</h1>
          <p className={S.heroDescription}>{t.home.heroDescription}</p>
        </div>

        <div className={S.heroBadges} aria-label={t.home.featuresAriaLabel}>
          <span className={S.heroBadge}>{t.home.globalStations}</span>
          <span className={S.heroBadge}>{t.home.favorites}</span>
          <span className={S.heroBadge}>{t.home.recentlyPlayed}</span>
        </div>

        <Link className={S.heroLink} to="/discover">
          {t.home.exploreStations}
        </Link>
      </header>

      <RecentlyPlayed />

      <header className={S.header}>
        <h2 className={S.title}>{t.home.topClickedTitle}</h2>
        <p className={S.description}>
          {t.home.topClickedDescription} • {stations.length}
        </p>
      </header>

      <div className={S.grid}>
        {stations.map((station) => (
          <StationCard key={station.stationuuid} station={station} />
        ))}
      </div>
    </section>
  );
};
