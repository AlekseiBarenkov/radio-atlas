import { PROXY_HEALTH_CHECK_STREAM_URL } from '@shared/config/player';
import { buildProxyStreamUrl } from './build-proxy-stream-url';
import type { UserProxy } from '../model/types';

const PROXY_CHECK_TIMEOUT_MS = 8_000;

export const checkUserProxy = (proxy: UserProxy): Promise<boolean> => {
  return new Promise((resolve) => {
    const proxyStreamUrl = buildProxyStreamUrl(proxy, PROXY_HEALTH_CHECK_STREAM_URL);
    const audio = new Audio(proxyStreamUrl);
    let timeout: number | null = null;

    const cleanup = () => {
      if (timeout !== null) {
        window.clearTimeout(timeout);
        timeout = null;
      }

      audio.removeEventListener('canplay', handleSuccess);
      audio.removeEventListener('loadedmetadata', handleSuccess);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };

    const finish = (value: boolean) => {
      cleanup();
      resolve(value);
    };

    const handleSuccess = () => {
      finish(true);
    };

    const handleError = () => {
      finish(false);
    };

    audio.addEventListener('canplay', handleSuccess);
    audio.addEventListener('loadedmetadata', handleSuccess);
    audio.addEventListener('error', handleError);

    timeout = window.setTimeout(() => {
      finish(false);
    }, PROXY_CHECK_TIMEOUT_MS);

    audio.preload = 'metadata';
    audio.load();
  });
};
