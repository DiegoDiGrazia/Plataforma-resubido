import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://panel.serviciosd.com/',
        changeOrigin: true,
      },
      '/codigo_recuperacion': {
        target: 'https://panel.serviciosd.com/',
        changeOrigin: true,
      },
      '/cambiar_clave': {
        target: 'https://panel.serviciosd.com/',
        changeOrigin: true,
      },
      '/app_obtener_usuarios': {
        target: 'https://panel.serviciosd.com/',
        changeOrigin: true,
      },
      '/app_obtener_notas': {
        target: 'https://panel.serviciosd.com/',
        changeOrigin: true,
      },
      '/app_obtener_medios': {
        target: 'https://panel.serviciosd.com/',
        changeOrigin: true,
      },
      '/app_obtener_categorias': {
        target: 'https://panel.serviciosd.com/',
        changeOrigin: true,
      },
      '/reporte_descargarpdfwa': {
        target: 'https://dashboard.serviciosd.com/',
        changeOrigin: true,
      },
      
    },
  },
});