export type PlayerRuntime = {
  destroy: () => void;
};

export type PlayerAudioController = {
  audio: HTMLAudioElement;
  play: () => Promise<void>;
  pause: () => void;
  reset: () => void;
  setSource: (streamUrl: string) => void;
  setVolume: (volume: number) => void;
  destroy: () => void;
};

export type PlaybackGuard = {
  next: () => number;
  current: () => number;
  isActual: (requestId: number) => boolean;
};

export type PlaybackSource = {
  streamUrl: string;
  proxyId: string | null;
};
