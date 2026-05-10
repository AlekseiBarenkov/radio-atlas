import type { UserProxy } from '../model/types';

export const buildProxyStreamUrl = (proxy: UserProxy, streamUrl: string): string => {
  const host = proxy.host.replace(/\/+$/, '');
  const port = proxy.port === null ? '' : `:${proxy.port}`;
  const baseUrl = `${host}${port}/proxy`;

  const params = new URLSearchParams({
    token: proxy.token,
    url: streamUrl,
  });

  return `${baseUrl}?${params.toString()}`;
};
