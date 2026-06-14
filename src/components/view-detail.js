import { busRoutes } from "../database.js";
import { getNextDeparture, isFavorite } from "../utils.js";

let detailMapInstance = null;
let detailMarkers = [];
let detailPolyline = null;

function renderDirectionalSchedule(scheduleObj) {
  if (!scheduleObj || !scheduleObj.toRosario || !scheduleObj.toNaranjo) {
    return `<p class="text-xs text-slate-400 text-center py-4">No hay horarios disponibles.</p>`;
  }

  const mapItem = (item) => `
    <div class="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-dark-border/40 rounded-xl hover:border-brand-green/30 transition-all text-xs">
      <div class="flex items-center gap-2">
        <span class="font-black text-slate-800 dark:text-slate-200">${item.time}</span>
        <span class="px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
          item.via === 'Arriba' 
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
        }">${item.via}</span>
      </div>
      <span class="text-[9px] text-slate-400 dark:text-slate-500 truncate max-w-[150px]" title="${item.route}">${item.route}</span>
    </div>
  `;

  const toRosarioHtml = scheduleObj.toRosario.map(mapItem).join("");
  const toNaranjoHtml = scheduleObj.toNaranjo.map(mapItem).join("");

  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <!-- Sentido Rosario -->
      <div>
        <h4 class="font-extrabold text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 border-b border-slate-50 dark:border-dark-border/30 pb-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Naranjo ➔ Rosario
        </h4>
        <div class="space-y-1.5">
          ${toRosarioHtml}
        </div>
      </div>

      <!-- Sentido Naranjo -->
      <div>
        <h4 class="font-extrabold text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 border-b border-slate-50 dark:border-dark-border/30 pb-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-brand-blue"></span>
          Rosario ➔ Naranjo
        </h4>
        <div class="space-y-1.5">
          ${toNaranjoHtml}
        </div>
      </div>
    </div>
  `;
}

export function renderRouteDetail(routeId) {
  const route = busRoutes.find(r => r.id === Number(routeId));
  if (!route) {
    return `
      <div class="max-w-xl mx-auto px-4 py-12 text-center">
        <div class="w-16 h-16 bg-red-100 dark:bg-red-950 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h3 class="text-lg font-black text-slate-800 dark:text-white">Ruta no encontrada</h3>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-2">La ruta solicitada no existe o fue eliminada.</p>
        <a href="#/" class="inline-block mt-6 px-5 py-3 bg-brand-green text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer">Volver al Inicio</a>
      </div>
    `;
  }

  const isFav = isFavorite(route.id);
  const nextTime = getNextDeparture(route.schedules.weekday);

  // Renderizar la lista de paradas
  const stopsHtml = route.stops.map((stop, index) => {
    const isFirst = index === 0;
    const isLast = index === route.stops.length - 1;
    return `
      <div class="relative pl-8 pb-6 last:pb-0 group">
        <!-- Línea conectora -->
        ${!isLast ? `<div class="timeline-line"></div>` : ""}
        
        <!-- Punto de parada -->
        <div class="timeline-dot ${isFirst || isLast ? 'ring-4 ring-brand-green/20' : 'bg-slate-400 dark:bg-slate-600'}"></div>
        
        <!-- Contenido de la parada -->
        <div>
          <h4 class="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-brand-green transition-colors">${stop.name}</h4>
          <p class="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">${stop.description}</p>
        </div>
      </div>
    `;
  }).join("");

  // Generar HTML direccional para cada tab
  const weekdayHtml = renderDirectionalSchedule(route.schedules.weekday);
  const saturdayHtml = renderDirectionalSchedule(route.schedules.saturday);
  const sundayHtml = renderDirectionalSchedule(route.schedules.sunday);

  return `
    <div class="max-w-6xl mx-auto px-4 py-6 pb-24 lg:py-8">
      
      <!-- Barra superior / Cabecera -->
      <div class="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-dark-border/50 pb-4 shrink-0">
        <div class="flex items-center gap-3">
          <!-- Botón de Atrás -->
          <button onclick="window.history.back()" class="touch-target p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer" title="Volver">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-black text-white" style="background-color: ${route.color}">RUTA ${route.number}</span>
              <span class="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-brand-green-dark dark:text-brand-green-light px-2 py-0.5 rounded font-black">${route.frequency}</span>
            </div>
            <h2 class="text-lg md:text-xl font-black text-slate-800 dark:text-white mt-1 leading-snug">${route.name}</h2>
          </div>
        </div>

        <!-- Botón favorito -->
        <button id="btn-detail-fav" data-route-id="${route.id}" class="touch-target p-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-slate-300 dark:text-slate-600 hover:text-amber-500 transition-colors cursor-pointer" title="Favorito">
          <svg class="w-6 h-6 ${isFav ? 'text-amber-500 fill-amber-500' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.252.583 1.828l-3.978 2.89a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.978-2.89a1 1 0 00-1.176 0l-3.978 2.89c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.978-2.89c-.777-.576-.378-1.828.582-1.828h4.907a1 1 0 00.95-.69l1.519-4.674z" />
          </svg>
        </button>
      </div>

      <!-- Distribución Responsiva en Dos Columnas (Desktop: lg:grid-cols-2) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Columna Izquierda: Detalles del Servicio e Itinerario (Paradas) -->
        <div class="space-y-6">
          
          <!-- Tarjeta de Detalles del Servicio -->
          <div class="bg-white dark:bg-dark-card p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-dark-border">
            <h3 class="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Información del Servicio</h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">${route.description}</p>
            
            <div class="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-dark-border/30">
              <div>
                <span class="text-[10px] text-slate-400 block uppercase font-bold">Empresa Operadora</span>
                <span class="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight block mt-0.5">${route.operator}</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 block uppercase font-bold">Duración Aprox.</span>
                <span class="text-xs font-bold text-slate-700 dark:text-slate-300 block mt-0.5">${route.duration} minutos</span>
              </div>
              <div class="mt-2">
                <span class="text-[10px] text-slate-400 block uppercase font-bold">Tarifa Autorizada</span>
                <span class="text-sm font-black text-brand-green block mt-0.5">₡${route.price}</span>
              </div>
              <div class="mt-2">
                <span class="text-[10px] text-slate-400 block uppercase font-bold">Próxima Salida hoy</span>
                <span class="text-sm font-black text-brand-blue dark:text-brand-green-light block mt-0.5">${nextTime}</span>
              </div>
            </div>
          </div>

          <!-- Timeline de paradas -->
          <div class="bg-white dark:bg-dark-card p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-dark-border">
            <h3 class="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Paradas y Recorrido</h3>
            <div class="relative pl-2">
              ${stopsHtml}
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Horarios Completos e Mapa Interactivo -->
        <div class="space-y-6">
          
          <!-- Horarios -->
          <div class="bg-white dark:bg-dark-card p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-dark-border">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Horarios de Salida</h3>
              
              <!-- Tab Controller para horarios -->
              <div class="bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 flex text-[10px] font-bold">
                <button id="btn-tab-weekday" class="px-2.5 py-1 bg-white dark:bg-dark-border text-slate-800 dark:text-white rounded-md shadow-sm transition-all focus:outline-none cursor-pointer">L-V</button>
                <button id="btn-tab-saturday" class="px-2.5 py-1 text-slate-500 dark:text-slate-400 rounded-md transition-all focus:outline-none cursor-pointer">Sáb</button>
                <button id="btn-tab-sunday" class="px-2.5 py-1 text-slate-500 dark:text-slate-400 rounded-md transition-all focus:outline-none cursor-pointer">Dom</button>
              </div>
            </div>

            <!-- Contenedores de Horarios -->
            <div id="container-weekday-hours" class="transition-opacity duration-200">
              ${weekdayHtml}
            </div>
            
            <div id="container-saturday-hours" class="transition-opacity duration-200 hidden">
              ${saturdayHtml}
            </div>

            <div id="container-sunday-hours" class="transition-opacity duration-200 hidden">
              ${sundayHtml}
            </div>
            
            <!-- Notas de Timetable -->
            <div class="mt-5 pt-3.5 border-t border-slate-50 dark:border-dark-border/30 text-[10px] text-slate-500 dark:text-slate-400 flex flex-col gap-1.5">
              <div class="flex items-center gap-2">
                <span class="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded font-black text-[9px]">ARRIBA</span>
                <span>Recorrido por Calle Hornos (Arriba).</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="px-1.5 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded font-black text-[9px]">ABAJO</span>
                <span>Recorrido por El Llano (Abajo).</span>
              </div>
              <div class="flex items-center gap-1.5 mt-1">
                <svg class="w-3.5 h-3.5 text-brand-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Horario oficial vigente a partir del 05 de mayo de 2025.</span>
              </div>
            </div>
          </div>

          <!-- Mapa local de ruta -->
          <div class="bg-white dark:bg-dark-card p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-dark-border flex flex-col">
            <h3 class="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Trazado Geográfico</h3>
            
            <div class="relative h-64 w-full">
              <div id="detail-map" class="w-full h-full rounded-2xl shadow-inner border border-slate-100 dark:border-dark-border z-10"></div>
              
              <!-- Fallback overlay offline -->
              <div id="detail-map-error-overlay" class="hidden absolute inset-0 bg-slate-100/90 dark:bg-dark-bg/95 z-20 flex flex-col items-center justify-center p-4 text-center rounded-2xl">
                <svg class="w-8 h-8 text-red-500 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Mapa no disponible sin conexión</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  `;
}

export function initRouteDetailEvents(routeId) {
  const route = busRoutes.find(r => r.id === Number(routeId));
  if (!route) return;

  // 1. Manejo de pestañas de horarios (L-V vs Sáb vs Dom)
  const tabWeekday = document.getElementById("btn-tab-weekday");
  const tabSaturday = document.getElementById("btn-tab-saturday");
  const tabSunday = document.getElementById("btn-tab-sunday");
  
  const containerWeekday = document.getElementById("container-weekday-hours");
  const containerSaturday = document.getElementById("container-saturday-hours");
  const containerSunday = document.getElementById("container-sunday-hours");

  if (tabWeekday && tabSaturday && tabSunday && containerWeekday && containerSaturday && containerSunday) {
    const tabs = [tabWeekday, tabSaturday, tabSunday];
    const containers = [containerWeekday, containerSaturday, containerSunday];

    const activateTab = (activeTab, activeContainer) => {
      tabs.forEach(t => {
        if (t === activeTab) {
          t.className = "px-2.5 py-1 bg-white dark:bg-dark-border text-slate-800 dark:text-white rounded-md shadow-sm transition-all focus:outline-none cursor-pointer";
        } else {
          t.className = "px-2.5 py-1 text-slate-500 dark:text-slate-400 rounded-md transition-all focus:outline-none cursor-pointer";
        }
      });
      containers.forEach(c => {
        if (c === activeContainer) {
          c.classList.remove("hidden");
        } else {
          c.classList.add("hidden");
        }
      });
    };

    tabWeekday.addEventListener("click", () => activateTab(tabWeekday, containerWeekday));
    tabSaturday.addEventListener("click", () => activateTab(tabSaturday, containerSaturday));
    tabSunday.addEventListener("click", () => activateTab(tabSunday, containerSunday));
  }

  // 2. Cargar e Inicializar Mapa de Detalle
  initDetailMap(route);
}

function initDetailMap(route) {
  const mapElement = document.getElementById("detail-map");
  if (!mapElement) return;

  // Si Leaflet no está cargado
  if (!window.L) {
    const errOverlay = document.getElementById("detail-map-error-overlay");
    if (errOverlay) errOverlay.classList.remove("hidden");
    return;
  }

  // Limpiar instancia previa
  if (detailMapInstance) {
    try {
      detailMapInstance.remove();
    } catch (e) {
      console.warn("Error remoción mapa detalle previo:", e);
    }
    detailMapInstance = null;
  }

  detailMarkers = [];
  detailPolyline = null;

  // Crear mapa
  detailMapInstance = window.L.map("detail-map", {
    zoomControl: false,
    attributionControl: false,
    tap: false
  });

  const isDark = document.documentElement.classList.contains("dark");
  const tileUrl = isDark 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  window.L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(detailMapInstance);

  // Dibujar línea del trayecto
  const latLngs = route.stops.map(stop => [stop.lat, stop.lng]);
  detailPolyline = window.L.polyline(latLngs, {
    color: route.color,
    weight: 5,
    opacity: 0.9
  }).addTo(detailMapInstance);

  // Dibujar marcadores de parada
  route.stops.forEach((stop, index) => {
    const isTerminal = index === 0 || index === route.stops.length - 1;
    
    const stopIcon = window.L.divIcon({
      className: "detail-map-marker",
      html: `
        <div class="flex items-center justify-center rounded-full border-2 border-white shadow-md" style="
          width: ${isTerminal ? '16px' : '12px'};
          height: ${isTerminal ? '16px' : '12px'};
          background-color: ${route.color};
        ">
          ${isTerminal ? '<div class="w-1.5 h-1.5 rounded-full bg-white"></div>' : ''}
        </div>
      `,
      iconSize: isTerminal ? [16, 16] : [12, 12],
      iconAnchor: isTerminal ? [8, 8] : [6, 6]
    });

    const marker = window.L.marker([stop.lat, stop.lng], { icon: stopIcon })
      .bindPopup(`<div class="p-0.5 text-center font-bold text-xs text-slate-800 dark:text-slate-100">${stop.name}</div>`)
      .addTo(detailMapInstance);

    detailMarkers.push(marker);
  });

  // Ajustar vista para contener toda la ruta
  try {
    const bounds = detailPolyline.getBounds();
    detailMapInstance.fitBounds(bounds, { padding: [20, 20] });
  } catch (e) {
    console.error("Error ajustando limites del mapa de detalle:", e);
    detailMapInstance.setView([route.stops[0].lat, route.stops[0].lng], 12);
  }
}
