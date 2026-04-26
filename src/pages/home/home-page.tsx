import { StationCard, useTopClickStations } from '@entities/station';
import { RecentlyPlayed } from '@widgets/recently-played';
import { Notice, PageHeader, SkeletonCard } from '@shared/ui';
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

  const top = (
    <>
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
    </>
  );

  if (isLoading) {
    return (
      <section className={S.page}>
        {top}

        <PageHeader title={t.home.topClickedTitle} description={t.home.topClickedDescription} />

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
        {top}

        <Notice tone="error" title={`${t.home.loadingError}: ${error?.message ?? t.common.unknownError}`} />
      </section>
    );
  }

  if (stations.length === 0) {
    return (
      <section className={S.page}>
        {top}

        <Notice title={t.home.stationsNotFound} />
      </section>
    );
  }

  return (
    <section className={S.page}>
      {top}

      <PageHeader title={t.home.topClickedTitle} description={`${t.home.topClickedDescription} • ${stations.length}`} />

      <div className={S.grid}>
        {stations.map((station) => (
          <StationCard key={station.stationuuid} station={station} />
        ))}
      </div>
    </section>
  );
};
