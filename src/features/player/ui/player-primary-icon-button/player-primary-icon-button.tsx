import { PLAYER_STATUSES, type PlayerStatus } from '@features/player/model/types';
import { IconButton } from '@/shared/ui';
import { LoaderCircle, Pause, Play, RotateCw } from 'lucide-react';
import S from './player-primary-icon-button.module.css';

type PlayerPrimaryIconButtonProps = {
  status: PlayerStatus;
  label: string;
  isCurrentStation?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export const PlayerPrimaryIconButton = (props: PlayerPrimaryIconButtonProps) => {
  const { status, label, isCurrentStation = true, disabled = false, onClick } = props;

  const renderIcon = () => {
    if (!isCurrentStation) {
      return <Play size={18} aria-hidden="true" />;
    }

    if (status === PLAYER_STATUSES.PLAYING) {
      return <Pause size={18} aria-hidden="true" />;
    }

    if (status === PLAYER_STATUSES.LOADING || status === PLAYER_STATUSES.BUFFERING) {
      return <LoaderCircle className={S.spinIcon} size={18} aria-hidden="true" />;
    }

    if (status === PLAYER_STATUSES.ERROR) {
      return <RotateCw size={18} aria-hidden="true" />;
    }

    return <Play size={18} aria-hidden="true" />;
  };

  return (
    <IconButton size="m" onClick={onClick} disabled={disabled} aria-label={label}>
      {renderIcon()}
    </IconButton>
  );
};
