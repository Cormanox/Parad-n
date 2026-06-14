import { busRoutes } from "../database.js";
import { getUserLocation } from "../utils.js";

// Variable global para almacenar la instancia del mapa y evitar reinicializaciones
let mapInstance = null;
let stopMarkers = [];
let routeLines = [];
let userLocationMarker = null;

export function renderMap() {
  return `
    <div class="max-w-6xl mx-auto px-4 py-6 pb-24 lg:py-8 h-full flex flex-col">
      <div class="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Mapa de Paradas</h2>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Navega interactivamente por el trayecto y paradas de la Ruta 256 (Naranjo - Rosario).</p>
        </div>
        
        <!-- Controles sobre el mapa -->
        <div class="flex items-center gap-2">
          <!-- Filtro de Ruta -->
          <div class="flex items-center bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl px-3 py-1.5 shadow-sm text-xs font-bold text-slate-700 dark:text-slate-200">
            <span class="text-slate-400 dark:text-slate-500 mr-2">Ruta:</span>
            <select id="map-route-filter" class="bg-transparent border-none focus:outline-none cursor-pointer pr-4">
              <option value="all" class="dark:bg-slate-900 font-bold">Mostrar Todas</option>
              ${busRoutes.map(route => `<option value="${route.id}" class="dark:bg-slate-900 font-bold">Ruta ${route.number} - ${route.operator.split(' ')[0]}</option>`).join("")}
            </select>
          </div>
          
          <!-- Botón centrar ubicación -->
          <button id="btn-map-locate" class="touch-target p-3 bg-brand-blue hover:bg-brand-blue-dark dark:bg-brand-green dark:hover:bg-brand-green-dark text-white rounded-xl shadow-md cursor-pointer transition-colors" title="Mi Ubicación">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11a13.978 13.978 0 00-3.358-8.89m12.89 8.89c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09V10a12.006 12.006 0 00-5.447-10.04" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Contenedor del Mapa -->
      <div class="relative flex-1" style="min-height: 480px;">
        <div id="main-map" class="w-full h-full rounded-3xl shadow-lg border border-slate-100 dark:border-dark-border" style="position: absolute; top: 0; bottom: 0; left: 0; right: 0;"></div>
        
        <!-- Overlay de carga / Fallback de Leaflet -->
        <div id="map-error-overlay" class="hidden absolute inset-0 bg-slate-100/90 dark:bg-dark-bg/95 z-20 flex flex-col items-center justify-center p-6 text-center rounded-3xl">
          <div class="w-16 h-16 bg-red-100 dark:bg-red-950 text-red-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h4 class="text-base font-black text-slate-800 dark:text-white">Mapa No Disponible Sin Conexión</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm">No pudimos cargar la biblioteca de mapas de Leaflet ni las capas de OpenStreetMap. Revisa tu conexión a internet.</p>
        </div>
      </div>
    </div>
  `;
}

export function initMainMap() {
  const mapElement = document.getElementById("main-map");
  if (!mapElement) return;

  // Comprobar si Leaflet está cargado
  if (!window.L) {
    const errorOverlay = document.getElementById("map-error-overlay");
    if (errorOverlay) errorOverlay.classList.remove("hidden");
    return;
  }

  // Si ya hay un mapa instanciado, lo removemos para evitar errores de duplicado
  if (mapInstance) {
    try {
      mapInstance.remove();
    } catch (e) {
      console.warn("Error al remover mapa previo:", e);
    }
    mapInstance = null;
  }

  // Limpiar referencias previas
  stopMarkers = [];
  routeLines = [];
  userLocationMarker = null;

  // Inicializar Leaflet centrado en el trayecto Naranjo - Rosario
  mapInstance = window.L.map("main-map", {
    zoomControl: false,
    tap: false // Evita interferencias en Safari móvil
  }).setView([10.082, -84.365], 13.5);

  // Agregar control de zoom en la esquina superior derecha
  window.L.control.zoom({ position: "topright" }).addTo(mapInstance);

  // Capa de OpenStreetMap (estilo cartográfico limpio y claro)
  const isDark = document.documentElement.classList.contains("dark");
  const tileUrl = isDark 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Modo oscuro
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"; // Modo claro
  
  const attribution = "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contribuyentes &copy; <a href='https://carto.com/attributions'>CARTO</a>";
  
  window.L.tileLayer(tileUrl, { attribution, maxZoom: 19 }).addTo(mapInstance);

  // Renderizar rutas y paradas
  drawRoutesAndStops("all");

  // Configurar eventos de interacción
  const routeFilter = document.getElementById("map-route-filter");
  if (routeFilter) {
    routeFilter.addEventListener("change", (e) => {
      drawRoutesAndStops(e.target.value);
    });
  }

  const btnLocate = document.getElementById("btn-map-locate");
  if (btnLocate) {
    btnLocate.addEventListener("click", () => {
      locateUserOnMap();
    });
  }
}

// Dibuja las paradas y las líneas de trayecto de las rutas seleccionadas
function drawRoutesAndStops(filter) {
  if (!mapInstance || !window.L) return;

  // 1. Limpiar elementos existentes del mapa
  routeLines.forEach(line => mapInstance.removeLayer(line));
  stopMarkers.forEach(marker => mapInstance.removeLayer(marker));
  routeLines = [];
  stopMarkers = [];

  // Filtrar rutas según selección
  const routesToDraw = filter === "all" 
    ? busRoutes 
    : busRoutes.filter(r => r.id === Number(filter));

  // Mapa auxiliar para agrupar información de paradas por coordenadas y evitar marcadores encimados
  const coordsMap = {};

  routesToDraw.forEach(route => {
    // A. Dibujar la línea de trayecto (Polyline) conectando las paradas
    const latLngs = route.stops.map(stop => [stop.lat, stop.lng]);
    const polyline = window.L.polyline(latLngs, {
      color: route.color,
      weight: 4,
      opacity: 0.85,
      dashArray: filter === "all" ? "1, 6" : "none" // Discontinuas en vista general, continua al seleccionar
    }).addTo(mapInstance);
    
    routeLines.push(polyline);

    // B. Recopilar paradas para dibujarlas más tarde sin duplicar las que comparten ubicación
    route.stops.forEach((stop, index) => {
      const coordKey = `${stop.lat.toFixed(5)},${stop.lng.toFixed(5)}`;
      if (!coordsMap[coordKey]) {
        coordsMap[coordKey] = {
          name: stop.name,
          lat: stop.lat,
          lng: stop.lng,
          description: stop.description,
          routes: []
        };
      }
      coordsMap[coordKey].routes.push({
        number: route.number,
        color: route.color,
        operator: route.operator,
        isTerminal: index === 0 || index === route.stops.length - 1
      });
    });
  });

  // C. Dibujar los marcadores de paradas unificados
  Object.values(coordsMap).forEach(stop => {
    // Definir color del marcador. Si comparte múltiples rutas, usar gris oscuro, sino el color de la única ruta.
    const markerColor = stop.routes.length === 1 ? stop.routes[0].color : "#475569";
    const isTerminal = stop.routes.some(r => r.isTerminal);

    // Icono personalizado con Leaflet DivIcon
    const stopIcon = window.L.divIcon({
      className: "custom-map-marker",
      html: `
        <div class="flex items-center justify-center rounded-full border-2 border-white shadow-md transition-transform hover:scale-110" style="
          width: ${isTerminal ? '18px' : '14px'};
          height: ${isTerminal ? '18px' : '14px'};
          background-color: ${markerColor};
        ">
          ${isTerminal ? '<div class="w-2 h-2 rounded-full bg-white"></div>' : ''}
        </div>
      `,
      iconSize: isTerminal ? [18, 18] : [14, 14],
      iconAnchor: isTerminal ? [9, 9] : [7, 7]
    });

    const popupContent = `
      <div class="p-1 min-w-[200px]">
        <h4 class="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <svg class="w-4 h-4 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          ${stop.name}
        </h4>
        <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">${stop.description}</p>
        <div class="mt-2.5 pt-2 border-t border-slate-100 dark:border-dark-border">
          <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Rutas en esta parada:</span>
          <div class="flex flex-wrap gap-1.5 mt-1">
            ${stop.routes.map(r => `
              <span class="px-2 py-0.5 rounded-md text-[9px] font-black text-white" style="background-color: ${r.color}">
                Ruta ${r.number}
              </span>
            `).join("")}
          </div>
        </div>
      </div>
    `;

    const marker = window.L.marker([stop.lat, stop.lng], { icon: stopIcon })
      .bindPopup(popupContent)
      .addTo(mapInstance);

    stopMarkers.push(marker);
  });

  // Ajustar límites del mapa (ajuste de zoom óptimo)
  if (filter !== "all" && routeLines.length > 0) {
    const bounds = routeLines[0].getBounds();
    mapInstance.fitBounds(bounds, { padding: [40, 40] });
  }
}

// Geolocaliza al usuario y coloca un marcador especial en el mapa
async function locateUserOnMap() {
  if (!mapInstance || !window.L) return;

  const btnLocate = document.getElementById("btn-map-locate");
  if (btnLocate) btnLocate.classList.add("animate-spin");

  try {
    const location = await getUserLocation();
    
    // Si ya existe el marcador de ubicación del usuario, removerlo
    if (userLocationMarker) {
      mapInstance.removeLayer(userLocationMarker);
    }

    // Crear icono personalizado tipo GPS
    const gpsIcon = window.L.divIcon({
      className: "user-pulse-marker",
      html: `
        <div class="w-3.5 h-3.5 bg-brand-blue border-2 border-white rounded-full shadow-lg relative z-20"></div>
      `,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    userLocationMarker = window.L.marker([location.lat, location.lng], { icon: gpsIcon })
      .bindPopup(`
        <div class="p-1 text-center">
          <span class="font-extrabold text-xs text-slate-800 dark:text-slate-100 block">Estás Aquí</span>
          <span class="text-[9px] text-slate-400 mt-0.5 block">Precisión: ±${Math.round(location.accuracy)}m</span>
        </div>
      `)
      .addTo(mapInstance);

    // Centrar mapa
    mapInstance.setView([location.lat, location.lng], 14, { animate: true });
    userLocationMarker.openPopup();

  } catch (e) {
    console.error(e);
    alert(e.message || "No se pudo obtener la geolocalización.");
  } finally {
    if (btnLocate) btnLocate.classList.remove("animate-spin");
  }
}
