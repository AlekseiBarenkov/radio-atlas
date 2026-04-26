import { StationCard, hasSimilarStationsSource, useSimilarStations, type RadioStation } from '@entities/station';
import { Notice, SkeletonCard } from '@shared/ui';
import S from './similar-stations.module.css';
import { useTranslation } from '@/features/localization';

type SimilarStationsProps = {
  station: RadioStation;
};

const SIMILAR_STATIONS_LIMIT = 6;
const SIMILAR_STATIONS_SKELETON_COUNT = 3;

export const SimilarStations = (props: SimilarStationsProps) => {
  const { station } = props;

  const t = useTranslation();

  const isVisible = hasSimilarStationsSource(station);

  const similarStationsQuery = useSimilarStations({
    station,
    limit: SIMILAR_STATIONS_LIMIT,
  });

  const stations = similarStationsQuery.data ?? [];

  if (!isVisible) {
    return null;
  }

  if (similarStationsQuery.isLoading) {
    return (
      <section className={S.wrapper}>
        <h2 className={S.header}>{t.similarStations.title}</h2>

        <div className={S.list}>
          {Array.from({ length: SIMILAR_STATIONS_SKELETON_COUNT }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </section>
    );
  }

  if (similarStationsQuery.isError) {
    return (
      <section className={S.wrapper}>
        <h2 className={S.header}>{t.similarStations.title}</h2>
        <Notice
          tone="error"
          title={`${t.similarStations.error}: ${similarStationsQuery.error?.message ?? t.common.unknownError}`}
        />
      </section>
    );
  }

  if (stations.length === 0) {
    return null;
  }

  return (
    <section className={S.wrapper}>
      <h2 className={S.header}>{t.similarStations.title}</h2>

      <div className={S.list}>
        {stations.map((similarStation) => (
          <StationCard key={similarStation.stationuuid} station={similarStation} />
        ))}
      </div>
    </section>
  );
};
