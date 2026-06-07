import { useEffect } from 'react';
import { subscribeSyncDataChanged } from '@/shared/lib/sync-data-events';
import { useCloudSyncStore } from '../../model/cloud-sync-store';

export const CloudSyncBridge = () => {
  const activeProvider = useCloudSyncStore((state) => state.activeProvider);
  const isProviderConnected = useCloudSyncStore((state) => {
    if (state.activeProvider === null) {
      return false;
    }

    return (state.providerConnectionState[state.activeProvider]?.connectedAt ?? null) !== null;
  });

  const hasSuccessfulSync = useCloudSyncStore((state) => {
    if (state.activeProvider === null) {
      return false;
    }

    return (state.providerSyncState[state.activeProvider]?.lastSyncedAt ?? null) !== null;
  });
  const autoSyncEnabled = useCloudSyncStore((state) => {
    if (state.activeProvider === null) {
      return false;
    }

    return state.providerAutoSyncState[state.activeProvider] ?? false;
  });
  const reconcileOnStart = useCloudSyncStore((state) => state.actions.reconcileOnStart);
  const markLocalUpdated = useCloudSyncStore((state) => state.actions.markLocalUpdated);

  useEffect(() => {
    const unsubscribe = subscribeSyncDataChanged(() => {
      markLocalUpdated();

      const state = useCloudSyncStore.getState();

      if (
        state.activeProvider !== null &&
        (state.providerConnectionState[state.activeProvider]?.connectedAt ?? null) !== null &&
        (state.providerSyncState[state.activeProvider]?.lastSyncedAt ?? null) !== null &&
        (state.providerAutoSyncState[state.activeProvider] ?? false)
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
