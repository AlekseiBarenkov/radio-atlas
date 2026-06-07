import type { RadioStation } from '@entities/station';
import type { UserProxy } from '@features/player-proxy';

export type SyncProxy = Omit<UserProxy, 'availability'>;

export type SyncData = {
  version: 1;
  updatedAt: string;
  app: 'radio-atlas';
  data: {
    favorites: RadioStation[];
    proxies: SyncProxy[];
  };
};
