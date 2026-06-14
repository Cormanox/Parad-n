import { busRoutes } from "../database.js";
import { getFavorites, getNextDeparture } from "../utils.js";

export function renderHome() {
  // Extraer paradas únicas para autocompletar origen/destino
  const allStops = [];
  busRoutes.forEach(route => {
    route.stops.forEach(stop => {
      if (!allStops.includes(stop.name)) {
        allStops.push(stop.name);
      }
    });
  });
  
  // Ordenar paradas alfabéticamente
  allStops.sort();

  // Filtrar favoritos
  const favIds = getFavorites();
  const favoriteRoutes = busRoutes.filter(r => favIds.includes(r.id));

  // Generar tarjetas de favoritos o marcador vacío
  let favoritesHtml = "";
  if (favoriteRoutes.length > 0) {
    favoritesHtml = `
      <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
        <svg class="w-5 h-5 text-amber-500 fill-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
        Tus Rutas Favoritas
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        ${favoriteRoutes.map(route => `
          <a href="#/ruta/${route.id}" class="block bg-white dark:bg-dark-card p-4 rounded-2xl shadow-md border border-slate-100 dark:border-dark-border hover:shadow-lg transition-all transform hover:-translate-y-1">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-1 text-xs font-black rounded-lg text-white" style="background-color: ${route.color}">Ruta ${route.number}</span>
              <span class="text-xs font-extrabold text-slate-400 dark:text-slate-500">${route.frequency}</span>
            </div>
            <h4 class="font-bold text-sm text-slate-800 dark:text-slate-200 mt-2 line-clamp-1">${route.name}</h4>
            <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">${route.operator}</p>
            <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-dark-border/50">
              <span class="text-xs font-bold text-brand-green">₡${route.price}</span>
              <span class="text-[11px] bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-md text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Prox: ${getNextDeparture(route.schedules.weekday)}
              </span>
            </div>
          </a>
        `).join("")}
      </div>
    `;
  } else {
    favoritesHtml = `
      <div class="bg-white dark:bg-dark-card p-5 rounded-2xl border border-dashed border-slate-200 dark:border-dark-border/80 text-center mb-8">
        <div class="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500 mb-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.252.583 1.828l-3.978 2.89a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.978-2.89a1 1 0 00-1.176 0l-3.978 2.89c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.978-2.89c-.777-.576-.378-1.828.582-1.828h4.907a1 1 0 00.95-.69l1.519-4.674z" /></svg>
        </div>
        <h4 class="font-bold text-sm text-slate-700 dark:text-slate-300">¿Tienes rutas habituales?</h4>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">Marca el icono de estrella en los detalles de cualquier ruta para tenerla aquí en accesos rápidos.</p>
      </div>
    `;
  }

  // Generar lista de salidas recomendadas (todas las rutas)
  const routeCardsHtml = busRoutes.map(route => {
    const nextTime = getNextDeparture(route.schedules.weekday);
    return `
      <a href="#/ruta/${route.id}" class="flex items-center gap-4 bg-white dark:bg-dark-card p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-dark-border hover:shadow-md hover:-translate-y-0.5 transition-all">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white shrink-0 shadow-inner" style="background-color: ${route.color}">
          ${route.number}
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">${route.name}</h4>
          <p class="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">${route.operator}</p>
          <div class="flex items-center gap-3 mt-1.5">
            <span class="text-xs font-bold text-brand-green">₡${route.price}</span>
            <span class="text-[10px] text-slate-400 dark:text-slate-500">•</span>
            <span class="text-xs text-slate-500 dark:text-slate-400">${route.duration} min estim.</span>
          </div>
        </div>
        <div class="text-right shrink-0">
          <div class="text-xs text-slate-400 dark:text-slate-500 font-semibold">Próxima</div>
          <div class="text-base font-black text-brand-blue dark:text-brand-green mt-0.5">${nextTime}</div>
          <div class="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">${route.frequency}</div>
        </div>
      </a>
    `;
  }).join("");

  return `
    <div class="max-w-6xl mx-auto px-4 py-6 pb-24 lg:py-8">
      
      <!-- Banner de bienvenida -->
      <div class="relative overflow-hidden bg-gradient-to-br from-brand-green-dark via-brand-green to-brand-blue-dark text-white rounded-3xl p-6 md:p-8 shadow-xl mb-6 md:mb-8">
        <!-- Elementos decorativos de fondo -->
        <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div class="absolute -left-10 -top-10 w-32 h-32 bg-brand-orange/20 rounded-full blur-xl animate-pulse"></div>
        
        <div class="relative z-10 max-w-lg">
          <h2 class="text-2xl md:text-3xl font-black tracking-tight leading-tight">¿Cuál es tu paradón hoy?</h2>
          <p class="text-emerald-100 text-xs md:text-sm mt-2 font-medium">Consulta horarios, paradas e itinerarios de autobuses en Costa Rica. Totalmente disponible sin conexión.</p>
        </div>
      </div>

      <!-- Grid Principal de Funciones (Buscador y Geolocalización) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-8">
        
        <!-- Formulario de Búsqueda Prominente (lg:col-span-7) -->
        <div class="lg:col-span-7 bg-white dark:bg-dark-card p-5 md:p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-dark-border">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Planifica tu viaje
          </h3>
          
          <form id="search-form" class="space-y-4">
            <div class="relative">
              <label class="block text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Origen</label>
              <div class="flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden focus-within:border-brand-green focus-within:ring-2 focus-within:ring-brand-green/20 transition-all">
                <span class="pl-4 text-slate-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </span>
                <select id="search-origin" class="w-full bg-transparent border-none py-3.5 px-3 text-sm text-slate-700 dark:text-slate-200 font-bold focus:outline-none cursor-pointer" required style="min-height: 48px;">
                  <option value="" disabled selected class="dark:bg-slate-900">Selecciona punto de partida...</option>
                  ${allStops.map(stop => `<option value="${stop}" class="dark:bg-slate-900">${stop}</option>`).join("")}
                </select>
              </div>
            </div>

            <!-- Botón de Intercambio (Swap) -->
            <div class="flex justify-center -my-2 relative z-10">
              <button type="button" id="btn-swap-search" class="touch-target w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-brand-green dark:text-slate-400 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer transition-all active:scale-95" title="Intercambiar origen y destino">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
              </button>
            </div>

            <div class="relative">
              <label class="block text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Destino</label>
              <div class="flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden focus-within:border-brand-green focus-within:ring-2 focus-within:ring-brand-green/20 transition-all">
                <span class="pl-4 text-slate-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </span>
                <select id="search-destination" class="w-full bg-transparent border-none py-3.5 px-3 text-sm text-slate-700 dark:text-slate-200 font-bold focus:outline-none cursor-pointer" required style="min-height: 48px;">
                  <option value="" disabled selected class="dark:bg-slate-900">Selecciona punto de llegada...</option>
                  ${allStops.map(stop => `<option value="${stop}" class="dark:bg-slate-900">${stop}</option>`).join("")}
                </select>
              </div>
            </div>

            <button type="submit" class="w-full touch-target bg-brand-green text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-brand-green-dark hover:shadow-none transition-all duration-200 cursor-pointer flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Buscar Horarios
            </button>
          </form>
        </div>

        <!-- Panel de Geolocalización (lg:col-span-5) -->
        <div class="lg:col-span-5 bg-white dark:bg-dark-card p-5 md:p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-dark-border flex flex-col">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <svg class="w-5 h-5 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11a13.978 13.978 0 00-3.358-8.89m12.89 8.89c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09V10a12.006 12.006 0 00-5.447-10.04" /></svg>
            ¿Dónde te encuentras?
          </h3>
          
          <p class="text-xs text-slate-400 dark:text-slate-500 mb-4">Usa el GPS para localizar paradas cercanas y calcular las distancias en tiempo real.</p>
          
          <!-- Botón de localización táctil grande -->
          <button id="btn-detect-location" class="touch-target w-full flex items-center justify-center gap-3 py-4 px-6 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 font-extrabold rounded-2xl transition-all cursor-pointer">
            <svg class="w-5 h-5 text-brand-blue animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Detectar Mi Ubicación</span>
          </button>
          
          <!-- Contenedor dinámico de paradas cercanas -->
          <div id="nearby-stops-container" class="mt-4 flex-1 overflow-y-auto space-y-3" style="max-height: 240px;">
            <div class="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-6 text-center">
              <svg class="w-8 h-8 opacity-40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11a13.978 13.978 0 00-3.358-8.89m12.89 8.89c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09V10a12.006 12.006 0 00-5.447-10.04" /></svg>
              <p class="text-xs">Presiona el botón de arriba para ver las paradas más cercanas a ti.</p>
            </div>
          </div>
        </div>

      </div>

      <!-- Sección de Favoritos -->
      <div id="home-favorites-wrapper">
        ${favoritesHtml}
      </div>

      <!-- Lista general de rutas / Salidas de hoy -->
      <div>
        <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v12m0 0l-4-4m4 4l4-4" /></svg>
          Salidas y Rutas de Hoy
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${routeCardsHtml}
        </div>
      </div>

    </div>
  `;
}
