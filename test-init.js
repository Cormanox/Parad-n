import { busRoutes } from './src/database.js';
import { getNextDeparture } from './src/utils.js';

console.log("=== TEST DE DATOS ===");
console.log("Cantidad de rutas cargadas:", busRoutes.length);
const route = busRoutes[0];
console.log("Ruta:", route.number, "-", route.name);
console.log("Paradas cargadas:", route.stops.map(s => s.name).join(" -> "));

try {
  console.log("\n=== TEST DE HORARIOS ===");
  const nextLunesViernes = getNextDeparture(route.schedules.weekday);
  console.log("Próxima salida L-V:", nextLunesViernes);
  
  const nextSabado = getNextDeparture(route.schedules.saturday);
  console.log("Próxima salida Sábado:", nextSabado);
  
  const nextDomingo = getNextDeparture(route.schedules.sunday);
  console.log("Próxima salida Domingo:", nextDomingo);
  
  console.log("\nTEST EXITOSO: Todas las estructuras responden correctamente sin errores.");
} catch (e) {
  console.error("ERROR EN HORARIOS:", e);
}
