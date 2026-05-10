import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react';
import S from './mini-player.module.css';

type MiniPlayerVolumeProps = {
  volume: number;
  label: string;
  onVolumeChange: (volume: number) => void;
};

export const MiniPlayerVolume = (props: MiniPlayerVolumeProps) => {
  const { volume, label, onVolumeChange } = props;

  const volumeValue = Math.round(volume * 100);

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(Number(event.target.value) / 100);
  };

  const renderVolumeIcon = () => {
    if (volumeValue === 0) {
      return <VolumeX size={16} aria-hidden="true" />;
    }

    if (volumeValue < 35) {
      return <Volume size={16} aria-hidden="true" />;
    }

    if (volumeValue < 70) {
      return <Volume1 size={16} aria-hidden="true" />;
    }

    return <Volume2 size={16} aria-hidden="true" />;
  };

  return (
    <div className={S.volumeControl}>
      <span className={S.volumeIcon}>{renderVolumeIcon()}</span>

      <input
        className={S.volumeSlider}
        type="range"
        min="0"
        max="100"
        step="1"
        value={volumeValue}
        onChange={handleVolumeChange}
        aria-label={label}
      />

      <span className={S.volumeValue}>{volumeValue}</span>
    </div>
  );
};
