import { busRoutes } from "../database.js";
import { getFavorites, getNextDeparture, isFavorite } from "../utils.js";

export function renderSearch() {
  // Extraer paradas únicas
  const allStops = [];
  busRoutes.forEach(route => {
    route.stops.forEach(stop => {
      if (!allStops.includes(stop.name)) {
        allStops.push(stop.name);
      }
    });
  });
  allStops.sort();

  return `
    <div class="max-w-6xl mx-auto px-4 py-6 pb-24 lg:py-8">
      <div class="mb-6">
        <h2 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Buscar Rutas</h2>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Filtra por empresa, número o paradas para encontrar tu bus.</p>
      </div>

      <!-- Filtros -->
      <div class="bg-white dark:bg-dark-card p-5 rounded-3xl shadow-md border border-slate-100 dark:border-dark-border mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Búsqueda de texto -->
          <div class="relative">
            <label class="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Buscar por texto</label>
            <div class="flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden focus-within:border-brand-green transition-all">
              <span class="pl-4 text-slate-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <input type="text" id="search-text-filter" placeholder="Empresa, número, provincia..." class="w-full bg-transparent border-none py-3 px-3 text-xs text-slate-700 dark:text-slate-200 font-bold focus:outline-none" style="min-height: 44px;" />
            </div>
          </div>

          <!-- Filtro de Origen -->
          <div>
            <label class="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Tiene parada en (Origen)</label>
            <div class="flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden focus-within:border-brand-green transition-all">
              <span class="pl-4 text-slate-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
              </span>
              <select id="search-origin-filter" class="w-full bg-transparent border-none py-3 px-3 text-xs text-slate-700 dark:text-slate-200 font-bold focus:outline-none cursor-pointer" style="min-height: 44px;">
                <option value="" class="dark:bg-slate-900">Cualquier parada...</option>
                ${allStops.map(stop => `<option value="${stop}" class="dark:bg-slate-900">${stop}</option>`).join("")}
              </select>
            </div>
          </div>

          <!-- Filtro de Destino -->
          <div>
            <label class="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Tiene parada en (Destino)</label>
            <div class="flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden focus-within:border-brand-green transition-all">
              <span class="pl-4 text-slate-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
              </span>
              <select id="search-destination-filter" class="w-full bg-transparent border-none py-3 px-3 text-xs text-slate-700 dark:text-slate-200 font-bold focus:outline-none cursor-pointer" style="min-height: 44px;">
                <option value="" class="dark:bg-slate-900">Cualquier parada...</option>
                ${allStops.map(stop => `<option value="${stop}" class="dark:bg-slate-900">${stop}</option>`).join("")}
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Resultados -->
      <div id="search-results" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Renderizado dinámico mediante JS -->
      </div>
    </div>
  `;
}

// Función auxiliar para renderizar los resultados de búsqueda dinámicamente
export function updateSearchResultsList(textFilter = "", originFilter = "", destinationFilter = "") {
  const container = document.getElementById("search-results");
  if (!container) return;

  const query = textFilter.toLowerCase().trim();

  const filteredRoutes = busRoutes.filter(route => {
    // 1. Filtro por texto (número, nombre, operador, descripción)
    const matchesText = !query || 
      route.number.toLowerCase().includes(query) ||
      route.name.toLowerCase().includes(query) ||
      route.operator.toLowerCase().includes(query) ||
      route.description.toLowerCase().includes(query);

    // 2. Filtro por parada de origen
    const matchesOrigin = !originFilter || 
      route.stops.some(stop => stop.name === originFilter);

    // 3. Filtro por parada de destino
    const matchesDestination = !destinationFilter || 
      route.stops.some(stop => stop.name === destinationFilter);

    // Si ambos filtros de parada están activos, el origen debe estar antes del destino en el recorrido
    let correctOrder = true;
    if (originFilter && destinationFilter) {
      const idxOrigin = route.stops.findIndex(stop => stop.name === originFilter);
      const idxDestination = route.stops.findIndex(stop => stop.name === destinationFilter);
      correctOrder = idxOrigin !== -1 && idxDestination !== -1 && idxOrigin < idxDestination;
    }

    return matchesText && matchesOrigin && matchesDestination && correctOrder;
  });

  if (filteredRoutes.length === 0) {
    container.innerHTML = `
      <div class="col-span-full bg-white dark:bg-dark-card p-8 rounded-3xl text-center border border-slate-100 dark:border-dark-border py-12">
        <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500 mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 class="font-extrabold text-slate-700 dark:text-slate-300">No se encontraron rutas</h3>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">Prueba cambiando los filtros o buscando otros términos de parada.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredRoutes.map(route => {
    const isFav = isFavorite(route.id);
    const nextTime = getNextDeparture(route.schedules.weekday);
    return `
      <div class="bg-white dark:bg-dark-card p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-dark-border hover:shadow-md transition-all flex items-center justify-between gap-4 group">
        <a href="#/ruta/${route.id}" class="flex-1 min-w-0 flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white shrink-0 shadow-inner" style="background-color: ${route.color}">
            ${route.number}
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-slate-800 dark:text-slate-200 text-sm truncate group-hover:text-brand-green dark:group-hover:text-brand-green-light transition-colors">${route.name}</h4>
            <p class="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">${route.operator}</p>
            <div class="flex items-center gap-2 mt-2">
              <span class="text-xs font-bold text-brand-green">₡${route.price}</span>
              <span class="text-slate-300 dark:text-slate-700 text-xs">|</span>
              <span class="text-[11px] text-slate-500 dark:text-slate-400">${route.stops.length} paradas</span>
              <span class="text-slate-300 dark:text-slate-700 text-xs">|</span>
              <span class="text-[11px] text-slate-500 dark:text-slate-400">⏱ ${route.duration}m</span>
            </div>
          </div>
        </a>
        
        <div class="flex flex-col items-end shrink-0 gap-2">
          <!-- Botón de Favorito Rápido -->
          <button data-fav-id="${route.id}" class="btn-toggle-favorite-search p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-300 dark:text-slate-600 hover:text-amber-500 transition-colors cursor-pointer touch-target">
            <svg class="w-5 h-5 ${isFav ? 'text-amber-500 fill-amber-500' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.252.583 1.828l-3.978 2.89a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.978-2.89a1 1 0 00-1.176 0l-3.978 2.89c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.978-2.89c-.777-.576-.378-1.828.582-1.828h4.907a1 1 0 00.95-.69l1.519-4.674z" />
            </svg>
          </button>
          
          <!-- Próxima Salida -->
          <div class="text-right">
            <span class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Salida</span>
            <div class="text-sm font-black text-brand-blue dark:text-brand-green-light">${nextTime}</div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}
