import { showNotificationToast } from "../utils.js";

export function renderProfile() {
  const isDarkMode = document.documentElement.classList.contains("dark");
  const notificationPermission = "Notification" in window ? Notification.permission : "denied";

  return `
    <div class="max-w-xl mx-auto px-4 py-6 pb-24 lg:py-8">
      <div class="mb-6">
        <h2 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Ajustes y Perfil</h2>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Configura las preferencias de tu PWA.</p>
      </div>

      <!-- Tarjeta PWA Instalación -->
      <div id="pwa-install-card" class="hidden bg-gradient-to-br from-brand-green to-brand-green-dark text-white p-5 rounded-3xl shadow-xl shadow-emerald-500/10 mb-6 relative overflow-hidden">
        <div class="absolute -right-8 -bottom-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div class="relative z-10">
          <h3 class="font-black text-base">Instalar Paradón</h3>
          <p class="text-[11px] text-emerald-100 mt-1 leading-relaxed">Agrega la aplicación a tu pantalla de inicio para acceder al instante y consultar rutas sin conexión a internet.</p>
          <button id="btn-install-profile" class="mt-4 px-5 py-3 bg-white text-brand-green-dark hover:bg-slate-50 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer touch-target">
            Añadir a Pantalla de Inicio
          </button>
        </div>
      </div>

      <div class="space-y-4">
        <!-- Grupo Preferencias Visuales -->
        <div class="bg-white dark:bg-dark-card rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-dark-border">
          <h3 class="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Preferencias Visuales</h3>
          
          <!-- Toggle Modo Oscuro -->
          <div class="flex items-center justify-between py-1">
            <div>
              <h4 class="font-bold text-sm text-slate-800 dark:text-slate-200">Modo Oscuro</h4>
              <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Optimiza la visualización en entornos de poca luz.</p>
            </div>
            
            <button id="toggle-dark-mode" class="touch-target w-12 h-6 rounded-full p-1 bg-slate-200 dark:bg-brand-green cursor-pointer transition-colors duration-200 focus:outline-none flex items-center">
              <span class="w-4 h-4 rounded-full bg-white shadow-md transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'} transition-transform duration-200"></span>
            </button>
          </div>
        </div>

        <!-- Grupo Notificaciones y Alertas -->
        <div class="bg-white dark:bg-dark-card rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-dark-border">
          <h3 class="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Notificaciones</h3>
          
          <!-- Habilitar Notificaciones -->
          <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-dark-border/50 pb-4">
            <div>
              <h4 class="font-bold text-sm text-slate-800 dark:text-slate-200">Alertas de Servicio</h4>
              <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Recibe avisos sobre cierres, atrasos o desvíos.</p>
            </div>
            
            <button id="btn-request-notifications" class="touch-target px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-brand-blue hover:text-white dark:hover:bg-brand-green text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer">
              ${notificationPermission === "granted" ? "Activas" : "Activar"}
            </button>
          </div>

          <!-- Simulación Alertas (Demo) -->
          <div class="pt-4">
            <h4 class="font-bold text-xs text-slate-700 dark:text-slate-300">Simulador de Alertas (Demostración)</h4>
            <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1 mb-3">Envía una notificación ficticia para probar el sistema de alertas de retraso.</p>
            <div class="flex flex-wrap gap-2">
              <button id="btn-simulate-alert-1" class="touch-target px-4 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer">
                Atraso Ruta 100 (TUASA)
              </button>
              <button id="btn-simulate-alert-2" class="touch-target px-4 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer">
                Cierre Vía Heredia
              </button>
            </div>
          </div>
        </div>

        <!-- Grupo Acerca De / Información -->
        <div class="bg-white dark:bg-dark-card rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-dark-border">
          <h3 class="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Información del Sistema</h3>
          
          <div class="space-y-3 text-xs">
            <div class="flex justify-between py-1 border-b border-slate-50 dark:border-dark-border/30">
              <span class="text-slate-400">Versión de App</span>
              <span class="font-bold text-slate-700 dark:text-slate-300">1.0.0 (Release)</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-50 dark:border-dark-border/30">
              <span class="text-slate-400">Base de datos local</span>
              <span class="font-bold text-slate-700 dark:text-slate-300">5 rutas (GAM Central)</span>
            </div>
            <div class="flex justify-between py-1">
              <span class="text-slate-400">Desarrollo PWA</span>
              <span class="font-bold text-brand-green">100% Instalable & Offline</span>
            </div>
          </div>
        </div>
        
        <p class="text-center text-[10px] text-slate-400 dark:text-slate-600 mt-8 font-semibold">Paradón Costa Rica • 2026 • ¡Pura Vida!</p>
      </div>
    </div>
  `;
}

// Configurar los manejadores de eventos específicos de esta vista
export function initProfileEvents() {
  // 1. Toggle Modo Oscuro
  const toggleDark = document.getElementById("toggle-dark-mode");
  if (toggleDark) {
    toggleDark.addEventListener("click", () => {
      const isDarkNow = document.documentElement.classList.toggle("dark");
      localStorage.setItem("theme", isDarkNow ? "dark" : "light");
      
      // Actualizar visual del switch
      const switchDot = toggleDark.querySelector("span");
      if (switchDot) {
        if (isDarkNow) {
          switchDot.classList.remove("translate-x-0");
          switchDot.classList.add("translate-x-6");
          toggleDark.classList.remove("bg-slate-200");
          toggleDark.classList.add("bg-brand-green");
        } else {
          switchDot.classList.remove("translate-x-6");
          switchDot.classList.add("translate-x-0");
          toggleDark.classList.remove("bg-brand-green");
          toggleDark.classList.add("bg-slate-200");
        }
      }
      
      // Disparar evento para que el mapa se entere del cambio de tema y cambie su capa
      const mapEvent = new CustomEvent("themechange", { detail: { isDark: isDarkNow } });
      window.dispatchEvent(mapEvent);
    });
  }

  // 2. Solicitar permisos de notificación
  const btnRequestNotif = document.getElementById("btn-request-notifications");
  if (btnRequestNotif) {
    btnRequestNotif.addEventListener("click", async () => {
      if (!("Notification" in window)) {
        alert("Tu navegador no soporta notificaciones de escritorio.");
        return;
      }

      if (Notification.permission === "granted") {
        showNotificationToast("Paradón", "Las notificaciones ya están activadas.");
        return;
      }

      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          btnRequestNotif.textContent = "Activas";
          showNotificationToast("Notificaciones Activas", "¡Listo! Recibirás avisos sobre cambios en tus rutas.");
        } else {
          alert("Permiso denegado. Puedes cambiarlo en la configuración del navegador.");
        }
      } catch (err) {
        console.error("Error pidiendo permiso notificaciones:", err);
      }
    });
  }

  // 3. Botones simuladores de alertas
  const btnAlert1 = document.getElementById("btn-simulate-alert-1");
  if (btnAlert1) {
    btnAlert1.addEventListener("click", () => {
      showNotificationToast(
        "Atraso Reportado: Ruta 100",
        "TUASA informa demoras de 15 minutos en General Cañas sentido San José debido a colisión menor en los Anonos."
      );
    });
  }

  const btnAlert2 = document.getElementById("btn-simulate-alert-2");
  if (btnAlert2) {
    btnAlert2.addEventListener("click", () => {
      showNotificationToast(
        "Alerta de Servicio: Ruta 200",
        "Busmi informa que el servicio a Heredia se desvía temporalmente por obras viales frente a Santo Domingo."
      );
    });
  }
}
