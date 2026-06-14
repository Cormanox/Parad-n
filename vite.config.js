import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  base: '/Parad-n/',
  server: {
    port: 3000,
    open: true
  }
});
