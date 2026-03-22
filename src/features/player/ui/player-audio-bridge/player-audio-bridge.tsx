import { useEffect } from 'react';
import { createPlayerRuntime } from '@features/player/lib/player-runtime';

export const PlayerAudioBridge = () => {
  useEffect(() => {
    const runtime = createPlayerRuntime();

    return () => {
      runtime.destroy();
    };
  }, []);

  return null;
};
