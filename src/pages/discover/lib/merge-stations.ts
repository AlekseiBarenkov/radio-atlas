import type { RadioStation } from '@entities/station';

export const mergeStations = (stationPages: RadioStation[][]): RadioStation[] => {
  const stationMap = new Map<string, RadioStation>();

  stationPages.forEach((page) => {
    page.forEach((station) => {
      stationMap.set(station.stationuuid, station);
    });
  });

  return Array.from(stationMap.values());
};
