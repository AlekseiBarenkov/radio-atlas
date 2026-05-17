import type { RadioStation } from '@entities/station';

type MediaSessionActionState = 'idle' | 'playing' | 'paused';

type PlayerMediaSessionControllerParams = {
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
};

type PlayerMediaSessionController = {
  setMetadata: (station: RadioStation) => void;
  setPlaybackState: (state: MediaSessionPlaybackState) => void;
  setActionState: (state: MediaSessionActionState) => void;
  reset: () => void;
  destroy: () => void;
};

const hasMediaSession = (): boolean => {
  return 'mediaSession' in navigator;
};

const getStationArtwork = (station: RadioStation): MediaImage[] => {
  const favicon = station.favicon.trim();

  if (favicon.length === 0) {
    return [];
  }

  return [{ src: favicon }];
};

export const createPlayerMediaSessionController = (
  params: PlayerMediaSessionControllerParams,
): PlayerMediaSessionController => {
  const setActionHandler = (action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
    if (!hasMediaSession()) {
      return;
    }

    navigator.mediaSession.setActionHandler(action, handler);
  };

  const setActionState: PlayerMediaSessionController['setActionState'] = () => {
    setActionHandler('play', params.onPlay);
    setActionHandler('pause', params.onPause);
    setActionHandler('stop', params.onStop);
  };

  setActionState('idle');

  return {
    setMetadata: (station) => {
      if (!hasMediaSession()) {
        return;
      }

      navigator.mediaSession.metadata = new MediaMetadata({
        title: station.name,
        artist: station.country || station.language || 'Radio Atlas',
        album: 'Radio Atlas',
        artwork: getStationArtwork(station),
      });
    },

    setPlaybackState: (state) => {
      if (!hasMediaSession()) {
        return;
      }

      navigator.mediaSession.playbackState = state;
    },

    setActionState,

    reset: () => {
      if (!hasMediaSession()) {
        return;
      }

      navigator.mediaSession.playbackState = 'none';
      navigator.mediaSession.metadata = null;
      setActionState('idle');
    },

    destroy: () => {
      setActionHandler('play', null);
      setActionHandler('pause', null);
      setActionHandler('stop', null);
    },
  };
};
