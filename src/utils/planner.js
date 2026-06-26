import { busRoutes } from '../database.js';
import { sanitize } from './security.js';

export function findRouteBetweenStops(originName, destName) {
  const origin = sanitize(originName);
  const dest = sanitize(destName);

  for (const route of busRoutes) {
    const stops = route.stops;
    const originIndex = stops.findIndex(s => s.name.toLowerCase() === origin.toLowerCase());
    const destIndex = stops.findIndex(s => s.name.toLowerCase() === dest.toLowerCase());

    if (originIndex !== -1 && destIndex !== -1) {
      // Si el origen está antes que el destino, es el sentido normal
      if (originIndex < destIndex) {
        return {
          route: route,
          direction: 'toRosario',
          stopsToTake: stops.slice(originIndex, destIndex + 1),
          distance: destIndex - originIndex
        };
      } else {
        // Sentido inverso (hacia Naranjo)
        return {
          route: route,
          direction: 'toNaranjo',
          stopsToTake: [...stops].reverse().slice(
            stops.length - 1 - originIndex,
            stops.length - 1 - destIndex + 1
          ),
          distance: originIndex - destIndex
        };
      }
    }
  }
  return null;
}
