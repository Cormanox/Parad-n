import { busRoutes } from "../database.js";
import { getFavorites, getNextDeparture, isFavorite } from "../utils.js";

export function renderFavorites() {
  const favIds = getFavorites();
  const favoriteRoutes = busRoutes.filter(route => favIds.includes(route.id));

  let contentHtml = "";

  if (favoriteRoutes.length === 0) {
    contentHtml = `
      <div class="bg-white dark:bg-dark-card p-10 rounded-3xl text-center border border-slate-100 dark:border-dark-border py-16 max-w-lg mx-auto mt-6">
        <div class="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500 mb-6">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.252.583 1.828l-3.978 2.89a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.978-2.89a1 1 0 00-1.176 0l-3.978 2.89c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.978-2.89c-.777-.576-.378-1.828.582-1.828h4.907a1 1 0 00.95-.69l1.519-4.674z" /></svg>
        </div>
        <h3 class="text-lg font-black text-slate-800 dark:text-white">Aún no tienes favoritos</h3>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
          Guarda tus rutas más frecuentes tocando el botón de estrella en los resultados de búsqueda o en el detalle de la ruta. Estarán disponibles aquí para consultarlas de inmediato, incluso sin conexión a internet.
        </p>
        <a href="#/buscar" class="inline-flex items-center gap-2 mt-6 px-6 py-3.5 bg-brand-green text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-brand-green-dark transition-all touch-target">
          Explorar rutas
        </a>
      </div>
    `;
  } else {
    contentHtml = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${favoriteRoutes.map(route => {
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
                <!-- Botón de Quitar Favorito -->
                <button data-fav-id="${route.id}" class="btn-toggle-favorite-favs p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-500 transition-colors cursor-pointer touch-target">
                  <svg class="w-5 h-5 fill-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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
        }).join("")}
      </div>
    `;
  }

  return `
    <div class="max-w-6xl mx-auto px-4 py-6 pb-24 lg:py-8">
      <div class="mb-6">
        <h2 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Rutas Favoritas</h2>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Tus accesos rápidos guardados localmente.</p>
      </div>

      <div id="favorites-list-container">
        ${contentHtml}
      </div>
    </div>
  `;
}
export function updateFavoritesView() {
  const container = document.getElementById("favorites-list-container");
  if (!container) return;
  const favIds = getFavorites();
  const favoriteRoutes = busRoutes.filter(route => favIds.includes(route.id));
  
  if (favoriteRoutes.length === 0) {
    container.innerHTML = `
      <div class="bg-white dark:bg-dark-card p-10 rounded-3xl text-center border border-slate-100 dark:border-dark-border py-16 max-w-lg mx-auto mt-6">
        <div class="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500 mb-6">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.252.583 1.828l-3.978 2.89a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.978-2.89a1 1 0 00-1.176 0l-3.978 2.89c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.978-2.89c-.777-.576-.378-1.828.582-1.828h4.907a1 1 0 00.95-.69l1.519-4.674z" /></svg>
        </div>
        <h3 class="text-lg font-black text-slate-800 dark:text-white">Aún no tienes favoritos</h3>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
          Guarda tus rutas más frecuentes tocando el botón de estrella en los resultados de búsqueda o en el detalle de la ruta. Estarán disponibles aquí para consultarlas de inmediato, incluso sin conexión a internet.
        </p>
        <a href="#/buscar" class="inline-flex items-center gap-2 mt-6 px-6 py-3.5 bg-brand-green text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-brand-green-dark transition-all touch-target">
          Explorar rutas
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      ${favoriteRoutes.map(route => {
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
              <button data-fav-id="${route.id}" class="btn-toggle-favorite-favs p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-500 transition-colors cursor-pointer touch-target">
                <svg class="w-5 h-5 fill-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
              <div class="text-right">
                <span class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Salida</span>
                <div class="text-sm font-black text-brand-blue dark:text-brand-green-light">${nextTime}</div>
              </div>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}
