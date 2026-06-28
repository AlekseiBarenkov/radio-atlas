import { useTranslation } from '@/features/localization';
import { TOAST_TONES, useToastActions } from '@/features/toast';
import { useEffect, useRef } from 'react';
import { usePlayerProxyStore } from '../../model/player-proxy-store';

export const RadioBrowserProxyToastBridge = () => {
  const t = useTranslation();
  const { showToast } = useToastActions();

  const activeProxy = usePlayerProxyStore((state) => {
    if (state.radioBrowserProxyId === null) {
      return null;
    }

    return state.proxies.find((proxy) => proxy.id === state.radioBrowserProxyId) ?? null;
  });

  const lastProxyIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (activeProxy === null) {
      lastProxyIdRef.current = null;
      return;
    }

    if (lastProxyIdRef.current === activeProxy.id) {
      return;
    }

    lastProxyIdRef.current = activeProxy.id;

    showToast({
      tone: TOAST_TONES.INFO,
      title: t.proxySettings.radioBrowserProxyEnabled,
      description: activeProxy.name,
    });
  }, [activeProxy, showToast, t]);

  return null;
};
