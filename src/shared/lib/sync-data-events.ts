type SyncDataChangedListener = () => void;

const syncDataChangedListeners = new Set<SyncDataChangedListener>();

export const subscribeSyncDataChanged = (listener: SyncDataChangedListener): (() => void) => {
  syncDataChangedListeners.add(listener);

  return () => {
    syncDataChangedListeners.delete(listener);
  };
};

export const notifySyncDataChanged = () => {
  syncDataChangedListeners.forEach((listener) => listener());
};
