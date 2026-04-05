import { StationCard, useSimilarStations } from '@entities/station';
import { SkeletonCard } from '@shared/ui';
import S from './similar-stations.module.css';

type SimilarStationsProps = {
  stationId: string;
  tags: string[];
};

const SIMILAR_STATIONS_LIMIT = 6;
const SIMILAR_STATIONS_SKELETON_COUNT = 3;

export const SimilarStations = (props: SimilarStationsProps) => {
  const { stationId, tags } = props;

  const similarStationsQuery = useSimilarStations({
    stationId,
    tags,
    limit: SIMILAR_STATIONS_LIMIT,
  });

  const stations = similarStationsQuery.data ?? [];

  if (similarStationsQuery.isPending) {
    return (
      <section className={S.wrapper}>
        <h2 className={S.header}>Similar stations</h2>

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
        <h2 className={S.header}>Similar stations</h2>
        <div className={S.empty}>Ошибка загрузки похожих станций</div>
      </section>
    );
  }

  if (stations.length === 0) {
    return null;
  }

  return (
    <section className={S.wrapper}>
      <h2 className={S.header}>Similar stations</h2>

      <div className={S.list}>
        {stations.map((station) => (
          <StationCard key={station.stationuuid} station={station} />
        ))}
      </div>
    </section>
  );
};
