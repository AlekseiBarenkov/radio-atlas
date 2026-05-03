import { useEffect, useRef } from 'react';
import { useTranslation } from '@/features/localization';
import { PLAYER_STATUSES, usePlayerUiState } from '@/features/player';
import { useToastActions } from '@/features/toast';

export const PlayerToastBridge = () => {
  const t = useTranslation();

  const { showToast } = useToastActions();
  const { currentStation, playerStatus, errorMessage } = usePlayerUiState();

  const lastErrorToastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentStation || playerStatus !== PLAYER_STATUSES.ERROR) {
      lastErrorToastKeyRef.current = null;
      return;
    }

    const errorToastKey = `${currentStation.stationuuid}:${errorMessage ?? 'unknown'}`;

    if (lastErrorToastKeyRef.current === errorToastKey) {
      return;
    }

    lastErrorToastKeyRef.current = errorToastKey;

    showToast({
      tone: 'error',
      title: t.player.playbackError,
      description: currentStation.name,
    });
  }, [currentStation, errorMessage, playerStatus, showToast, t]);

  return null;
};
