import './style.css';
import { renderNavigation } from "./components/bottom-nav.js";
import { renderHome } from "./components/view-home.js";
import { renderSearch, updateSearchResultsList } from "./components/view-search.js";
import { renderFavorites, updateFavoritesView } from "./components/view-favorites.js";

import { renderMap, initMainMap } from "./components/view-map.js";
import { renderProfile, initProfileEvents } from "./components/view-profile.js";
import { renderRouteDetail, initRouteDetailEvents } from "./components/view-detail.js";
import { renderRoutePlanner } from "./components/view-planner.js";
import { toggleFavorite, getUserLocation, calculateDistance, formatDistance, isFavorite } from "./utils.js";
import { busRoutes } from "./database.js";
import { store } from "./store.js";
import { sanitize } from "./utils/security.js";
import { findRouteBetweenStops } from "./utils/planner.js";

// Estado global gestionado por store
let deferredInstallPrompt = null;

// Cache de vistas para evitar re-renders costosos
const viewCache = new Map();

// Enrutador Principal
function router() {
  const hash = window.location.hash || "#/";
  const appContainer = document.getElementById("app");
  const desktopDetailPanel = document.getElementById("desktop-detail-panel");
  
  if (!appContainer) return;

  // Actualizar indicador de fecha
  const dateHeader = document.getElementById("header-date");
  if (dateHeader) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateHeader.textContent = new Date().toLocaleDateString('es-CR', options);
  }

  // 1. Caso: Detalle de Ruta (#/ruta/:id)
  if (hash.startsWith("#/ruta/")) {
    const routeId = hash.split("/")[2];
    const isDesktop = window.innerWidth >= 1024;

    if (isDesktop) {
      if (store.state.currentTab !== "home" && store.state.currentTab !== "search" && store.state.currentTab !== "favorites") {
        store.setState({ currentTab: "search" });
      }

      renderTabContent(store.state.currentTab, appContainer);
      bindTabEvents(store.state.currentTab);

      if (desktopDetailPanel) {
        desktopDetailPanel.classList.remove("hidden");
        desktopDetailPanel.innerHTML = renderRouteDetail(routeId);
        initRouteDetailEvents(routeId);
        bindDetailEvents(routeId);
      }
    } else {
      if (desktopDetailPanel) desktopDetailPanel.classList.add("hidden");
      appContainer.innerHTML = renderRouteDetail(routeId);
      initRouteDetailEvents(routeId);
      bindDetailEvents(routeId);
    }
    
    renderNav(store.state.currentTab);
    return;
  }

  // 2. Casos de Tabs estándar
  let tab = "home";
  if (hash === "#/") tab = "home";
  else if (hash === "#/buscar") tab = "search";
  else if (hash === "#/favoritos") tab = "favorites";
  else if (hash === "#/mapa") tab = "map";
  else if (hash === "#/perfil") tab = "profile";
  else if (hash === "#/planificador") tab = "planner";
  
  store.setState({ currentTab: tab });

  if (window.innerWidth >= 1024) {
    if (desktopDetailPanel) {
      if (tab === "map" || tab === "profile") {
        desktopDetailPanel.classList.add("hidden");
      } else {
        desktopDetailPanel.classList.remove("hidden");
        desktopDetailPanel.innerHTML = `
          <div class="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-slate-500">
            <svg class="w-12 h-12 opacity-30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 class="font-bold text-sm text-slate-700 dark:text-slate-300">Detalle en Paralelo</h4>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">Haz clic en cualquier ruta para ver sus detalles, horarios y mapa aquí al lado.</p>
          </div>
        `;
      }
    }
  } else {
    if (desktopDetailPanel) desktopDetailPanel.classList.add("hidden");
  }

  renderTabContent(tab, appContainer);
  bindTabEvents(tab);
  renderNav(tab);
}

// Renderiza el HTML del tab seleccionado
function renderTabContent(tab, container) {
  if (viewCache.has(tab)) {
    container.innerHTML = viewCache.get(tab);
    applyViewAnimation(container);
    return;
  }

  container.classList.remove("view-enter-active");
  container.classList.add("view-enter");
  
  let html = "";
  if (tab === "home") html = renderHome();
  else if (tab === "search") html = renderSearch();
  else if (tab === "favorites") html = renderFavorites();
  else if (tab === "map") html = renderMap();
  else if (tab === "profile") html = renderProfile();
  else if (tab === "planner") html = renderRoutePlanner();

  viewCache.set(tab, html);
  container.innerHTML = html;

  setTimeout(() => {
    container.classList.remove("view-enter");
    container.classList.add("view-enter-active");
  }, 50);
}

function applyView(container) {
  container.classList.remove("view-enter-active");
  container.classList.add("view-enter");
  setTimeout(() => {
    container.classList.remove("view-enter");
    container.classList.add("view-enter-active");
  }, 50);
}

// Enlaza eventos específicos por cada vista
function bindTabEvents(tab) {
  if (tab === "home") {
    // A. Intercambiar origen y destino
    const btnSwap = document.getElementById("btn-swap-search");
    if (btnSwap) {
      btnSwap.addEventListener("click", () => {
        const originSelect = document.getElementById("search-origin");
        const destSelect = document.getElementById("search-destination");
        if (originSelect && destSelect) {
          const temp = originSelect.value;
          originSelect.value = destSelect.value;
          destSelect.value = temp;
        }
        
        // Micro-interacción: rotar el botón 180 grados al presionar
        btnSwap.classList.add("rotate-180");
        setTimeout(() => {
          btnSwap.classList.remove("rotate-180");
        }, 300);
      });
    }

    // B. Procesar formulario de búsqueda
    const form = document.getElementById("search-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const origin = document.getElementById("search-origin").value;
        const dest = document.getElementById("search-destination").value;
        // Redirigir al buscador con los filtros de parada activos
        window.location.hash = `#/buscar?origin=${encodeURIComponent(origin)}&dest=${encodeURIComponent(dest)}`;
      });
    }

    // C. Geolocalización de paradas cercanas
    const btnLocate = document.getElementById("btn-detect-location");
    if (btnLocate) {
      btnLocate.addEventListener("click", async () => {
        const nearbyContainer = document.getElementById("nearby-stops-container");
        if (!nearbyContainer) return;
        
        btnLocate.disabled = true;
        nearbyContainer.innerHTML = `
          <div class="flex items-center justify-center py-8 text-slate-500 gap-2">
            <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.21" /></svg>
            <span class="text-xs font-bold">Obteniendo coordenadas GPS...</span>
          </div>
        `;

        try {
          const loc = await getUserLocation();
          
          // Recopilar todas las paradas de todas las rutas y calcular distancias
          const stopsWithDistance = [];
          busRoutes.forEach(route => {
            route.stops.forEach(stop => {
              const dist = calculateDistance(loc.lat, loc.lng, stop.lat, stop.lng);
              stopsWithDistance.push({
                routeId: route.id,
                routeNumber: route.number,
                routeName: route.name,
                routeColor: route.color,
                stopName: stop.name,
                distance: dist
              });
            });
          });

          // Ordenar por cercanía (menor distancia)
          stopsWithDistance.sort((a, b) => a.distance - b.distance);

          // Filtrar paradas duplicadas consecutivas para dar variedad
          const uniqueStops = [];
          const seenStops = new Set();
          for (const item of stopsWithDistance) {
            if (!seenStops.has(item.stopName)) {
              seenStops.add(item.stopName);
              uniqueStops.push(item);
            }
            if (uniqueStops.length >= 3) break; // Quedarse con las 3 más cercanas
          }

          if (uniqueStops.length === 0) {
            nearbyContainer.innerHTML = `<p class="text-xs text-center py-4 text-slate-400">No se encontraron paradas.</p>`;
            return;
          }

          nearbyContainer.innerHTML = uniqueStops.map(stop => `
            <a href="#/ruta/${stop.routeId}" class="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-dark-border/40 transition-colors">
              <div class="min-w-0">
                <h4 class="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">${stop.stopName}</h4>
                <div class="flex items-center gap-1.5 mt-1">
                  <span class="px-1.5 py-0.5 rounded text-[8px] font-black text-white" style="background-color: ${stop.routeColor}">Ruta ${stop.routeNumber}</span>
                  <p class="text-[9px] text-slate-400 dark:text-slate-500 truncate">${stop.routeName}</p>
                </div>
              </div>
              <span class="text-xs font-black text-brand-blue shrink-0 ml-3">${formatDistance(stop.distance)}</span>
            </a>
          `).join("");

        } catch (e) {
          nearbyContainer.innerHTML = `
            <div class="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center gap-2">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span>${e.message || "Error al obtener ubicación."}</span>
            </div>
          `;
        } finally {
          btnLocate.disabled = false;
        }
      });
    }
  }

  else if (tab === "search") {
    // A. Detectar si venimos redirigidos de Home con parámetros en el hash
    const hash = window.location.hash;
    let prefilledOrigin = "";
    let prefilledDest = "";
    if (hash.includes("?")) {
      const queryParams = new URLSearchParams(hash.split("?")[1]);
      prefilledOrigin = queryParams.get("origin") || "";
      prefilledDest = queryParams.get("dest") || "";
    }

    const selectOrigin = document.getElementById("search-origin-filter");
    const selectDest = document.getElementById("search-destination-filter");
    const textFilterInput = document.getElementById("search-text-filter");

    if (selectOrigin && prefilledOrigin) selectOrigin.value = prefilledOrigin;
    if (selectDest && prefilledDest) selectDest.value = prefilledDest;

    // Ejecutar búsqueda inicial
    updateSearchResultsList(
      textFilterInput ? textFilterInput.value : "",
      selectOrigin ? selectOrigin.value : "",
      selectDest ? selectDest.value : ""
    );

    // B. Enlazar eventos de filtros en vivo
    const triggerSearch = () => {
      updateSearchResultsList(
        textFilterInput ? textFilterInput.value : "",
        selectOrigin ? selectOrigin.value : "",
        selectDest ? selectDest.value : ""
      );
    };

    if (textFilterInput) textFilterInput.addEventListener("input", triggerSearch);
    if (selectOrigin) selectOrigin.addEventListener("change", triggerSearch);
    if (selectDest) selectDest.addEventListener("change", triggerSearch);

    // C. Enlazar botones de favoritos rápidos de la lista
    const resultsContainer = document.getElementById("search-results");
    if (resultsContainer) {
      resultsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-toggle-favorite-search");
        if (btn) {
          e.preventDefault();
          const routeId = btn.getAttribute("data-fav-id");
          const isNowFav = toggleFavorite(routeId);
          
          // Actualizar icono de estrella
          const svg = btn.querySelector("svg");
          if (isNowFav) {
            svg.classList.add("text-amber-500", "fill-amber-500");
          } else {
            svg.classList.remove("text-amber-500", "fill-amber-500");
          }
          
          // Si estamos en desktop, actualizar también la vista de inicio/favoritos detrás
          const homeFavoritesWrapper = document.getElementById("home-favorites-wrapper");
          if (homeFavoritesWrapper && currentTab === "home") {
            router(); // Re-renderizar si es necesario
          }
        }
      });
    }
  }

  else if (tab === "favorites") {
    // Enlazar botones de quitar favoritos
    const favsList = document.getElementById("favorites-list-container");
    if (favsList) {
      favsList.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-toggle-favorite-favs");
        if (btn) {
          e.preventDefault();
          const routeId = btn.getAttribute("data-fav-id");
          toggleFavorite(routeId);
          updateFavoritesView(); // Actualizar solo la lista de favoritos reactivamente
        }
      });
    }
  }

  else if (tab === "map") {
    // Inicializar mapa de Leaflet
    initMainMap();
  }

  else if (tab === "profile") {
    initProfileEvents();
    renderInstallPromo();
  } else if (tab === "planner") {
    initPlannerEvents();
  }
}

function initPlannerEvents() {
  const originSelect = document.getElementById("plan-origin");
  const destSelect = document.getElementById("plan-destination");
  const btnCalculate = document.getElementById("btn-calculate-route");
  const resultContainer = document.getElementById("planner-result");

  if (!originSelect || !destSelect) return;

  // Llenar selects con todas las paradas únicas
  const allStops = [];
  busRoutes.forEach(route => {
    route.stops.forEach(stop => {
      if (!allStops.find(s => s.name === stop.name)) {
        allStops.push(stop);
      }
    });
  });

  const optionsHtml = allStops.map(stop => `<option value="${sanitize(stop.name)}">${stop.name}</option>`).join("");
  originSelect.innerHTML += optionsHtml;
  destSelect.innerHTML += optionsHtml;

  if (btnCalculate) {
    btnCalculate.addEventListener("click", () => {
      const origin = originSelect.value;
      const dest = destSelect.value;

      if (!origin || !dest) {
        alert("Por favor selecciona origen y destino");
        return;
      }

      const result = findRouteBetweenStops(origin, dest);

      if (result) {
        resultContainer.classList.remove("hidden");
        resultContainer.innerHTML = `
          <div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-5 rounded-2xl space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-emerald-800 dark:text-emerald-400">Ruta Encontrada</h3>
              <span class="px-2 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full">Sugerencia</span>
            </div>
            
            <div class="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style="background-color: ${result.route.color}">
                ${result.route.number}
              </div>
              <div>
                <p class="text-xs font-bold text-slate-800 dark:text-slate-200">${result.route.name}</p>
                <p class="text-[10px] text-slate-500 dark:text-slate-400">Dirección: ${result.direction === 'toRosario' ? 'Hacia Rosario' : 'Hacia Naranjo'}</p>
              </div>
            </div>

            <div class="space-y-3">
              <p class="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Paradas del trayecto</p>
              <div class="relative pl-6 space-y-4 border-l-2 border-dashed border-emerald-300 dark:border-emerald-800">
                ${result.stopsToTake.map((stop, index) => `
                  <div class="relative">
                    <div class="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900"></div>
                    <p class="text-xs font-medium ${index === 0 ? 'text-brand-blue font-bold' : index === result.stopsToTake.length - 1 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-600 dark:text-slate-400'}">
                      ${stop.name}
                    </p>
                  </div>
                `).join("")}
              </div>
            </div>

            <a href="#/ruta/${result.route.id}" class="block w-full text-center py-3 bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-colors">
              Ver Horarios de esta Ruta
            </a>
          </div>
        `;
      } else {
        resultContainer.classList.remove("hidden");
        resultContainer.innerHTML = `
          <div class="p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-400 text-xs rounded-2xl text-center">
            No se encontró una ruta directa entre estas paradas. Intenta con otras ubicaciones.
          </div>
        `;
      }
    });
  }
}
  const btnDetailFav = document.getElementById("btn-detail-fav");
  if (btnDetailFav) {
    btnDetailFav.addEventListener("click", () => {
      const isNowFav = toggleFavorite(routeId);
      const svg = btnDetailFav.querySelector("svg");
      if (isNowFav) {
        svg.classList.add("text-amber-500", "fill-amber-500");
      } else {
        svg.classList.remove("text-amber-500", "fill-amber-500");
      }

      // Si estamos en escritorio y detrás se muestra la lista de favoritos, actualizarla
      if (window.innerWidth >= 1024 && currentTab === "favorites") {
        updateFavoritesView();
      }
    });
  }
}

// Renderiza la barra de navegación lateral/inferior
function renderNav(activeTab) {
  const navContainer = document.getElementById("nav-container");
  if (navContainer) {
    navContainer.innerHTML = renderNavigation(activeTab);
    updateInstallTrigger();
    updateNetworkBanner();
  }
}

// Manejo del Banner de Red (Online / Offline)
function updateNetworkBanner() {
  const bannerOffline = document.getElementById("network-alert-banner");
  const bannerOnline = document.getElementById("network-online-banner");
  const dotSidebar = document.getElementById("network-dot-sidebar");
  const textSidebar = document.getElementById("network-text-sidebar");

  const isOnline = navigator.onLine;

  if (bannerOffline && bannerOnline) {
    if (isOnline) {
      bannerOffline.classList.add("hidden");
      bannerOnline.classList.remove("hidden");
    } else {
      bannerOffline.classList.remove("hidden");
      bannerOnline.classList.add("hidden");
    }
  }

  if (dotSidebar && textSidebar) {
    if (isOnline) {
      dotSidebar.className = "w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block";
      textSidebar.textContent = "Servicio Online";
    } else {
      dotSidebar.className = "w-2.5 h-2.5 rounded-full bg-amber-500 inline-block";
      textSidebar.textContent = "Modo Sin Conexión";
    }
  }
}

// PWA: Manejo de la Solicitud de Instalación (Add to Home Screen)
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  
  // Mostrar los disparadores de instalación
  renderInstallPromo();
  updateInstallTrigger();
});

// Muestra la tarjeta de instalación en Perfil
function renderInstallPromo() {
  const installCard = document.getElementById("pwa-install-card");
  if (installCard && deferredInstallPrompt) {
    installCard.classList.remove("hidden");
    
    const btnInstall = document.getElementById("btn-install-profile");
    if (btnInstall) {
      btnInstall.addEventListener("click", triggerPwaInstall);
    }
  }
}

// Muestra el botón de instalación en la barra lateral (Desktop)
function updateInstallTrigger() {
  const installSidebar = document.getElementById("pwa-install-sidebar");
  if (installSidebar && deferredInstallPrompt) {
    installSidebar.classList.remove("hidden");
    
    const btnSidebar = document.getElementById("btn-install-sidebar");
    if (btnSidebar) {
      btnSidebar.addEventListener("click", triggerPwaInstall);
    }
  }
}

async function triggerPwaInstall() {
  if (!deferredInstallPrompt) return;
  
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  console.log(`Resultado de instalación del usuario: ${outcome}`);
  
  // Limpiar prompt diferido
  deferredInstallPrompt = null;
  
  // Ocultar elementos de UI
  const installCard = document.getElementById("pwa-install-card");
  if (installCard) installCard.classList.add("hidden");
  
  const installSidebar = document.getElementById("pwa-install-sidebar");
  if (installSidebar) installSidebar.classList.add("hidden");
}

window.addEventListener("appinstalled", () => {
  console.log("Paradón PWA fue instalada correctamente.");
  deferredInstallPrompt = null;
});

// Listener de eventos globales
window.addEventListener("hashchange", router);
window.addEventListener("resize", () => {
  // Cuando la ventana cambia de tamaño, recalculamos layout para paradas y enrutado
  router();
});

window.addEventListener("online", updateNetworkBanner);
window.addEventListener("offline", updateNetworkBanner);

// Recibir notificación de cambio de tema desde profile
window.addEventListener("themechange", (e) => {
  // Si estamos en el tab del mapa, re-renderizar mapa con la capa correspondiente al tema
  if (currentTab === "map") {
    initMainMap();
  }
});

// Inicializar la aplicación
const initApp = () => {
  // Cargar preferencia de tema oscuro guardada
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  // Inicializar enrutado
  router();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
