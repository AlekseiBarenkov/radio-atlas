import { useEffect } from 'react';
import { subscribeSyncDataChanged } from '@/shared/lib/sync-data-events';
import { useCloudSyncStore } from '../../model/cloud-sync-store';

export const CloudSyncBridge = () => {
  const activeProvider = useCloudSyncStore((state) => state.activeProvider);
  const autoSyncEnabled = useCloudSyncStore((state) => state.autoSyncEnabled);
  const reconcileOnStart = useCloudSyncStore((state) => state.actions.reconcileOnStart);
  const markLocalUpdated = useCloudSyncStore((state) => state.actions.markLocalUpdated);

  useEffect(() => {
    const unsubscribe = subscribeSyncDataChanged(() => {
      markLocalUpdated();

      const state = useCloudSyncStore.getState();

      if (state.activeProvider !== null && state.autoSyncEnabled) {
        state.actions.syncInBackground();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [markLocalUpdated]);

  useEffect(() => {
    if (activeProvider === null || !autoSyncEnabled) {
      return;
    }

    reconcileOnStart();
  }, [activeProvider, autoSyncEnabled, reconcileOnStart]);

  return null;
};
