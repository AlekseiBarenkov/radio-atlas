import { useState } from 'react';
import type { RadioStation } from '../../model/types';
import S from './station-logo.module.css';

type StationLogoSize = 'card' | 'page' | 'mini';

type StationLogoProps = {
  station: RadioStation;
  size?: StationLogoSize;
  loading?: 'lazy' | 'eager';
};

const getStationLogoSrc = (station: RadioStation): string | null => {
  const favicon = station.favicon.trim();

  return favicon.length > 0 ? favicon : null;
};

const getStationFallbackLetter = (station: RadioStation): string => {
  const letter = station.name.trim().slice(0, 1).toUpperCase();

  return letter.length > 0 ? letter : '?';
};

export const StationLogo = (props: StationLogoProps) => {
  const { station, size = 'card', loading = 'lazy' } = props;

  const [isImageFailed, setIsImageFailed] = useState(false);

  const src = getStationLogoSrc(station);
  const shouldShowImage = src !== null && !isImageFailed;

  return (
    <div className={S.logo} data-size={size} data-station-logo>
      {shouldShowImage ? (
        <img
          className={S.image}
          src={src}
          alt={station.name}
          loading={loading}
          onError={() => {
            setIsImageFailed(true);
          }}
        />
      ) : (
        <div className={S.fallback} aria-label={station.name} role="img">
          <span className={S.fallbackLetter}>{getStationFallbackLetter(station)}</span>
        </div>
      )}
    </div>
  );
};
