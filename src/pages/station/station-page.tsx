import { Link, useNavigate, useParams } from 'react-router-dom';
import { getStationPlayerState, hasSimilarStationsSource, useStationById } from '@entities/station';
import { SimilarStations } from '@widgets/similar-stations';
import { FavoriteToggle } from '@features/favorites';
import {
  getPlayerPrimaryButtonLabel,
  runPlayerPrimaryAction,
  usePlayerActions,
  usePlayerUiState,
} from '@features/player';
import { Skeleton } from '@shared/ui';
import S from './station-page.module.css';

const getStationImage = (favicon: string): string | null => {
  const normalizedFavicon = favicon.trim();

  return normalizedFavicon.length > 0 ? normalizedFavicon : null;
};

const getStationBitrateLabel = (bitrate: number): string => {
  return bitrate > 0 ? `${bitrate} kbps` : 'Unknown';
};

const getStationTags = (tags: string): string[] => {
  return tags
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag, index, array) => tag.length > 0 && array.indexOf(tag) === index);
};

export const StationPage = () => {
  const { stationId } = useParams<{ stationId: string }>();
  const navigate = useNavigate();

  const normalizedStationId = stationId?.trim() ?? '';
  const stationQuery = useStationById(normalizedStationId);

  const { currentStation, playerStatus, errorMessage, isReconnectSuggested } = usePlayerUiState();
  const actions = usePlayerActions();

  const station = stationQuery.data;

  const stationPlayerState = station
    ? getStationPlayerState({
        station,
        currentStation,
        playerStatus,
        errorMessage,
        isReconnectSuggested,
      })
    : null;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/discover');
  };

  const handlePlayClick = () => {
    if (!station || stationPlayerState?.isButtonBusy) {
      return;
    }

    runPlayerPrimaryAction({
      status: playerStatus,
      isReconnectSuggested,
      currentStation,
      targetStation: station,
      actions,
    });
  };

  if (stationQuery.isPending) {
    return (
      <section className={S.page}>
        <button className={S.backLink} type="button" onClick={handleBack}>
          ← Back
        </button>

        <div className={S.hero}>
          <div className={S.logoWrapper}>
            <Skeleton width={120} height={120} borderRadius={20} />
          </div>

          <div className={S.heroContent}>
            <header className={S.header}>
              <Skeleton width={280} height={44} borderRadius={12} />
              <Skeleton width={220} height={20} borderRadius={10} />
            </header>

            <div className={S.actions}>
              <Skeleton width={120} height={44} borderRadius={12} />
              <Skeleton width={140} height={44} borderRadius={12} />
            </div>
          </div>
        </div>

        <section className={S.metaSection}>
          <h2 className={S.metaTitle}>Station metadata</h2>

          <div className={S.metaGrid}>
            {Array.from({ length: 4 }).map((_, index) => (
              <article key={index} className={S.metaCard}>
                <Skeleton width={90} height={14} borderRadius={8} />
                <div className={S.skeletonSpacer} />
                <Skeleton width="70%" height={20} borderRadius={10} />
              </article>
            ))}
          </div>
        </section>
      </section>
    );
  }

  if (stationQuery.isError) {
    return (
      <section className={S.page}>
        <button className={S.backLink} type="button" onClick={handleBack}>
          ← Back
        </button>

        <div className={S.empty}>Ошибка загрузки станции: {stationQuery.error?.message ?? 'Unknown error'}</div>
      </section>
    );
  }

  if (!station || !stationPlayerState) {
    return (
      <section className={S.page}>
        <button className={S.backLink} type="button" onClick={handleBack}>
          ← Back
        </button>

        <div className={S.empty}>Станция не найдена</div>
      </section>
    );
  }

  const image = getStationImage(station.favicon);
  const tags = getStationTags(station.tags);
  const isSimilarStationsVisible = hasSimilarStationsSource(station);

  return (
    <section className={S.page}>
      <button className={S.backLink} type="button" onClick={handleBack}>
        ← Back
      </button>

      <div className={S.hero}>
        <div className={S.logoWrapper}>
          {image ? (
            <img className={S.logo} src={image} alt={station.name} loading="lazy" />
          ) : (
            <div className={S.logoFallback}>{station.name.slice(0, 1).toUpperCase()}</div>
          )}
        </div>

        <div className={S.heroContent}>
          <header className={S.header}>
            <h1 className={S.title}>{station.name}</h1>
            <p className={S.subtitle}>
              {station.country || 'Unknown country'} • {station.language || 'Unknown language'}
            </p>

            {stationPlayerState.statusMessage.tone === 'info' && (
              <div className={S.status}>{stationPlayerState.statusMessage.text}</div>
            )}
            {stationPlayerState.statusMessage.tone === 'error' && (
              <div className={S.error}>{stationPlayerState.statusMessage.text}</div>
            )}
          </header>

          <div className={S.actions}>
            <button
              className={S.playButton}
              type="button"
              onClick={handlePlayClick}
              disabled={stationPlayerState.isButtonBusy}
            >
              {getPlayerPrimaryButtonLabel({
                status: playerStatus,
                isReconnectSuggested,
                isCurrentStation: stationPlayerState.isCurrentStation,
              })}
            </button>

            <FavoriteToggle station={station} />
          </div>
        </div>
      </div>

      <section className={S.metaSection}>
        <h2 className={S.metaTitle}>Station metadata</h2>

        <div className={S.metaGrid}>
          <article className={S.metaCard}>
            <p className={S.metaLabel}>Country</p>
            <p className={S.metaValue}>{station.country || 'Unknown'}</p>
          </article>

          <article className={S.metaCard}>
            <p className={S.metaLabel}>Language</p>
            <p className={S.metaValue}>{station.language || 'Unknown'}</p>
          </article>

          <article className={S.metaCard}>
            <p className={S.metaLabel}>Bitrate</p>
            <p className={S.metaValue}>{getStationBitrateLabel(station.bitrate)}</p>
          </article>

          <article className={S.metaCard}>
            <p className={S.metaLabel}>Codec</p>
            <p className={S.metaValue}>{station.codec || 'Unknown'}</p>
          </article>

          <article className={S.metaCard}>
            <p className={S.metaLabel}>Clicks</p>
            <p className={S.metaValue}>{station.clickcount}</p>
          </article>

          <article className={S.metaCard}>
            <p className={S.metaLabel}>Votes</p>
            <p className={S.metaValue}>{station.votes}</p>
          </article>
        </div>
      </section>

      <section className={S.metaSection}>
        <h2 className={S.metaTitle}>Tags</h2>

        {tags.length > 0 ? (
          <div className={S.tags}>
            {tags.map((tag) => (
              <Link key={tag} className={S.tag} to={`/discover?tag=${encodeURIComponent(tag)}`}>
                {tag}
              </Link>
            ))}
          </div>
        ) : (
          <div className={S.empty}>У станции не указаны теги</div>
        )}
      </section>

      {isSimilarStationsVisible && <SimilarStations station={station} />}
    </section>
  );
};
