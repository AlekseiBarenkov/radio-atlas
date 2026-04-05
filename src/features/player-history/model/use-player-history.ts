import { usePlayerHistoryStore } from './player-history-store';

type UsePlayerHistoryResult = {
  stations: ReturnType<typeof usePlayerHistoryStore.getState>['stations'];
  addStation: ReturnType<typeof usePlayerHistoryStore.getState>['actions']['addStation'];
  clear: ReturnType<typeof usePlayerHistoryStore.getState>['actions']['clear'];
  hasStations: boolean;
};

export const usePlayerHistory = (): UsePlayerHistoryResult => {
  const stations = usePlayerHistoryStore((state) => state.stations);
  const addStation = usePlayerHistoryStore((state) => state.actions.addStation);
  const clear = usePlayerHistoryStore((state) => state.actions.clear);

  return {
    stations,
    addStation,
    clear,
    hasStations: stations.length > 0,
  };
};
