import type { PlayerAudioController } from './player-runtime-types';

type PlayerAudioControllerParams = {
  volume: number;
};

export const createPlayerAudioController = (params: PlayerAudioControllerParams): PlayerAudioController => {
  const audio = new Audio();

  audio.preload = 'none';
  audio.volume = params.volume;

  return {
    audio,

    play: () => {
      return audio.play();
    },

    pause: () => {
      audio.pause();
    },

    reset: () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    },

    setSource: (streamUrl) => {
      audio.src = streamUrl;
    },

    setVolume: (volume) => {
      audio.volume = volume;
    },

    destroy: () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    },
  };
};
