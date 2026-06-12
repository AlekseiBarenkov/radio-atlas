import { useEffect } from 'react';
import { subscribeSyncDataChanged } from '@/shared/lib/sync-data-events';
import { useCloudSyncStore } from '../../model/cloud-sync-store';

export const CloudSyncBridge = () => {
  const activeProvider = useCloudSyncStore((state) => state.activeProvider);
  const activeProviderState = useCloudSyncStore((state) => {
    if (state.activeProvider === null) {
      return null;
    }

    return state.providers[state.activeProvider] ?? null;
  });
  const reconcileOnStart = useCloudSyncStore((state) => state.actions.reconcileOnStart);
  const markLocalUpdated = useCloudSyncStore((state) => state.actions.markLocalUpdated);

  const isProviderConnected = (activeProviderState?.connectedAt ?? null) !== null;
  const hasSuccessfulSync = (activeProviderState?.lastSyncedAt ?? null) !== null;
  const autoSyncEnabled = activeProviderState?.autoSyncEnabled ?? false;

  useEffect(() => {
    const unsubscribe = subscribeSyncDataChanged(() => {
      markLocalUpdated();

      const state = useCloudSyncStore.getState();

      if (state.activeProvider === null) {
        return;
      }

      const providerState = state.providers[state.activeProvider];

      if (
        (providerState?.connectedAt ?? null) !== null &&
        (providerState?.lastSyncedAt ?? null) !== null &&
        (providerState?.autoSyncEnabled ?? false)
      ) {
        state.actions.syncInBackground();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [markLocalUpdated]);

  useEffect(() => {
    if (activeProvider === null || !isProviderConnected || !hasSuccessfulSync || !autoSyncEnabled) {
      return;
    }

    reconcileOnStart();
  }, [activeProvider, autoSyncEnabled, hasSuccessfulSync, isProviderConnected, reconcileOnStart]);

  return null;
};
