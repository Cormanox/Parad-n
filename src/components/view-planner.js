import { sanitize } from '../utils/security.js';

export function renderRoutePlanner() {
  return `
    <div class="p-6 space-y-6 animate-fade-in">
      <div class="flex items-center gap-3 mb-2">
        <div class="p-2 bg-brand-blue/10 rounded-lg text-brand-blue">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 13l5.447-2.724a1 1 0 00.553-8.658V5.618a1 1 0 00-1.447-.894L15 7m0 13V7" /></svg>
        </div>
        <h2 class="text-xl font-black text-slate-800 dark:text-white">Planificador de Viaje</h2>
      </div>

      <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm space-y-4">
        <div class="space-y-3">
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Origen</label>
          <select id="plan-origin" class="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-dark-border text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-blue outline-none transition-all">
            <option value="">Selecciona una parada...</option>
          </select>
        </div>

        <div class="flex justify-center">
          <div class="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </div>
        </div>

        <div class="space-y-3">
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Destino</label>
          <select id="plan-destination" class="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-dark-border text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-blue outline-none transition-all">
            <option value="">Selecciona una parada...</option>
          </select>
        </div>

        <button id="btn-calculate-route" class="w-full py-4 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2">
          <span>Calcular Ruta</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </button>
      </div>

      <div id="planner-result" class="hidden space-y-4 animate-slide-up">
        <!-- Results will be injected here -->
      </div>
    </div>
  `;
}
