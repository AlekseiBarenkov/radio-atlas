export const getStationPath = (stationId: string): string => {
  return `/station/${encodeURIComponent(stationId)}`;
};
