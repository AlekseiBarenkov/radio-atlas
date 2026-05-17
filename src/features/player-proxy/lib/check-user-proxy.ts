import { PROXY_HEALTH_CHECK_URL } from '@shared/config/player';
import { buildProxyStreamUrl } from './build-proxy-stream-url';
import type { UserProxy } from '../model/types';

const PROXY_CHECK_TIMEOUT_MS = 8_000;

export const checkUserProxy = (proxy: UserProxy): Promise<boolean> => {
  return new Promise((resolve) => {
    const proxyUrl = buildProxyStreamUrl(proxy, PROXY_HEALTH_CHECK_URL);
    const image = new Image();
    let timeout: number | null = null;
    let finished = false;

    const cleanup = () => {
      if (timeout !== null) {
        window.clearTimeout(timeout);
        timeout = null;
      }

      image.onload = null;
      image.onerror = null;
      image.src = '';
    };

    const finish = (value: boolean) => {
      if (finished) {
        return;
      }

      finished = true;
      cleanup();
      resolve(value);
    };

    image.onload = () => {
      finish(true);
    };

    image.onerror = () => {
      finish(false);
    };

    timeout = window.setTimeout(() => {
      finish(false);
    }, PROXY_CHECK_TIMEOUT_MS);

    image.src = proxyUrl;
  });
};
