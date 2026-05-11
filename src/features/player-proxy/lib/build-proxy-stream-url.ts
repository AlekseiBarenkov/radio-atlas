import type { UserProxy } from '../model/types';

export const buildProxyStreamUrl = (proxy: UserProxy, streamUrl: string): string => {
  const host = proxy.host.replace(/\/+$/, '');
  const port = proxy.port === null ? '' : `:${proxy.port}`;
  const baseUrl = `${host}${port}/proxy`;

  const params = new URLSearchParams({
    url: streamUrl,
  });

  if (proxy.token.trim().length > 0) {
    params.set('token', proxy.token);
  }

  return `${baseUrl}?${params.toString()}`;
};
