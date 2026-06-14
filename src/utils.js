// Utilidades para la aplicación Paradón

// 1. Cálculo de distancia usando la fórmula de Haversine (en kilómetros)
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distancia en km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// 2. Formateador de distancia legible
export function formatDistance(km) {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

// 3. Geolocalización del usuario en base a Promesas
export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("La geolocalización no es soportada por este navegador."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let msg = "Error desconocido al obtener la ubicación.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = "El usuario denegó el acceso a la ubicación.";
            break;
          case error.POSITION_UNAVAILABLE:
            msg = "La información de ubicación no está disponible.";
            break;
          case error.TIMEOUT:
            msg = "Se agotó el tiempo para obtener la ubicación.";
            break;
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

// 4. Gestión de rutas favoritas en LocalStorage
const FAVORITES_KEY = "paradon_favorites";

export function getFavorites() {
  try {
    const favs = localStorage.getItem(FAVORITES_KEY);
    return favs ? JSON.parse(favs) : [];
  } catch (e) {
    console.error("Error al leer favoritos:", e);
    return [];
  }
}

export function isFavorite(routeId) {
  const favs = getFavorites();
  return favs.includes(Number(routeId));
}

export function toggleFavorite(routeId) {
  const id = Number(routeId);
  let favs = getFavorites();
  if (favs.includes(id)) {
    favs = favs.filter((item) => item !== id);
  } else {
    favs.push(id);
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  return favs.includes(id);
}

// 5. Simulación de notificación push
export function showNotificationToast(title, body) {
  // Intentar usar la API de notificaciones nativas si el permiso está concedido
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "./logo.svg"
    });
  }
  
  // En cualquier caso, mostrar un Toast elegante en pantalla
  const toastContainer = document.getElementById("toast-container");
  if (!toastContainer) return;
  
  const toast = document.createElement("div");
  toast.className = "flex items-center gap-3 bg-slate-900 dark:bg-emerald-900/90 text-white p-4 rounded-xl shadow-2xl border border-slate-700/50 dark:border-emerald-600/30 transition-all duration-300 transform translate-y-10 opacity-0 max-w-sm w-full";
  toast.innerHTML = `
    <div class="p-2 bg-emerald-500 rounded-lg text-slate-900">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    </div>
    <div class="flex-1">
      <h4 class="font-bold text-sm text-emerald-400">${title}</h4>
      <p class="text-xs text-slate-300 mt-0.5">${body}</p>
    </div>
    <button class="text-slate-400 hover:text-white transition-colors" onclick="this.parentElement.remove()">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  `;
  
  toastContainer.appendChild(toast);
  
  // Trigger anim
  setTimeout(() => {
    toast.classList.remove("translate-y-10", "opacity-0");
  }, 10);
  
  // Auto-remove
  setTimeout(() => {
    toast.classList.add("translate-y-10", "opacity-0");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 5000);
}

// 6. Encontrar próxima salida basado en la hora actual
export function getNextDeparture(schedulesList) {
  if (!schedulesList) return "--:--";
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeString = `${String(currentHours).padStart(2, "0")}:${String(currentMinutes).padStart(2, "0")}`;
  
  let list = [];
  if (schedulesList.toRosario) {
    // Combina salidas de ambas direcciones para la próxima salida general
    list = [...schedulesList.toRosario, ...schedulesList.toNaranjo];
  } else if (Array.isArray(schedulesList)) {
    list = schedulesList;
  } else {
    return "--:--";
  }

  const times = list.map(item => typeof item === "object" ? item.time : item);
  times.sort();
  
  // Buscar la primera hora de salida mayor que la hora actual
  const next = times.find(time => time > currentTimeString);
  
  // Si no hay más salidas hoy, devolver la primera de mañana
  return next || times[0] || "--:--";
}
