// Componente de Navegación Adaptativa (Bottom Nav en móvil, Sidebar en desktop)

export function renderNavigation(activeTab) {
  const tabs = [
    { id: "home", label: "Inicio", hash: "#/", icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>` },
    { id: "search", label: "Buscar", hash: "#/buscar", icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>` },
    { id: "favorites", label: "Favoritos", hash: "#/favoritos", icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.252.583 1.828l-3.978 2.89a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.978-2.89a1 1 0 00-1.176 0l-3.978 2.89c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.978-2.89c-.777-.576-.378-1.828.582-1.828h4.907a1 1 0 00.95-.69l1.519-4.674z" /></svg>` },
    { id: "map", label: "Mapa", hash: "#/mapa", icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>` },
    { id: "profile", label: "Perfil", hash: "#/perfil", icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>` }
  ];

  // 1. Renderizado para Desktop Sidebar (lg:flex)
  const sidebarHtml = `
    <aside class="hidden lg:flex flex-col w-64 h-screen fixed top-0 left-0 bg-white dark:bg-dark-card border-r border-slate-200 dark:border-dark-border z-30 p-6">
      <!-- Logo y Encabezado -->
      <div class="flex items-center gap-3 mb-8">
        <img src="./logo.svg" alt="Logo" width="40" height="40" class="w-10 h-10 drop-shadow-md">
        <div>
          <h1 class="text-xl font-black bg-gradient-to-r from-brand-green to-brand-blue bg-clip-text text-transparent tracking-tight">Paradón</h1>
          <p class="text-xs text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase">Buses de Costa Rica</p>
        </div>
      </div>
      
      <!-- Enlaces de Navegación -->
      <nav class="flex-1 space-y-1">
        ${tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return `
            <a href="${tab.hash}" 
               class="flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 group relative ${
                 isActive 
                   ? 'bg-brand-green/10 dark:bg-brand-green/20 text-brand-green-dark dark:text-brand-green' 
                   : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
               }">
              ${isActive ? `<span class="absolute left-0 top-3.5 bottom-3.5 w-1 bg-brand-green rounded-r-md"></span>` : ""}
              <span class="transition-transform group-hover:scale-110 ${isActive ? 'text-brand-green' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}">
                ${tab.icon}
              </span>
              ${tab.label}
            </a>
          `;
        }).join("")}
      </nav>

      <!-- Panel Inferior del Sidebar (Instalador / Info Offline) -->
      <div class="mt-auto pt-6 border-t border-slate-100 dark:border-dark-border">
        <div id="pwa-install-sidebar" class="hidden">
          <button id="btn-install-sidebar" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-green text-white text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-brand-green-dark hover:shadow-none transition-all cursor-pointer touch-target">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Instalar App
          </button>
        </div>
        <div class="flex items-center gap-2 mt-4 text-xs text-slate-400 dark:text-slate-500">
          <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" id="network-dot-sidebar"></div>
          <span id="network-text-sidebar">Servicio Online</span>
        </div>
      </div>
    </aside>
  `;

  // 2. Renderizado para Móvil/Tablet Bottom Nav (lg:hidden)
  const bottomNavHtml = `
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-dark-card/90 backdrop-blur-lg border-t border-slate-200/80 dark:border-dark-border/80 z-30 px-2 pb-safe">
      <div class="flex h-full items-center justify-around max-w-md mx-auto">
        ${tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return `
            <a href="${tab.hash}" 
               class="flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold transition-all duration-200 relative group touch-target"
               style="min-height: 48px; min-width: 48px;">
              
              <!-- Indicador de Punto Activo -->
              ${isActive ? `<span class="absolute top-0 w-8 h-1 bg-brand-green rounded-b-full"></span>` : ""}
              
              <!-- Icono -->
              <span class="mb-0.5 transition-transform group-active:scale-90 ${
                isActive 
                  ? 'text-brand-green' 
                  : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
              }">
                ${tab.icon}
              </span>
              
              <!-- Etiqueta -->
              <span class="${
                isActive 
                  ? 'text-brand-green font-extrabold' 
                  : 'text-slate-500 dark:text-slate-400'
              }">
                ${tab.label}
              </span>
            </a>
          `;
        }).join("")}
      </div>
    </nav>
  `;

  return sidebarHtml + bottomNavHtml;
}
