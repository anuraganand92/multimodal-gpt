import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import history from 'connect-history-api-fallback';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'single-page-application',
      configureServer(server) {
        server.middlewares.use(
          history({
            disableDotRule: true,
            htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
          })
        );
      },
    },
  ],
  build: {
    outDir: 'build/static',
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_AZURE_BACKEND_URL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    'process.env.VITE_AZURE_BACKEND_URL': JSON.stringify(process.env.VITE_AZURE_BACKEND_URL),
    'process.env.VITE_AZURE_STORAGE_ACCOUNT_NAME': JSON.stringify(process.env.VITE_AZURE_STORAGE_ACCOUNT_NAME),
    'process.env.VITE_AZURE_CONTAINER_NAME': JSON.stringify(process.env.VITE_AZURE_CONTAINER_NAME),
    'process.env.VITE_AZURE_SAS_TOKEN': JSON.stringify(process.env.VITE_AZURE_SAS_TOKEN),
    'process.env.VITE_ENTRA_ID_CLIENT_ID': JSON.stringify(process.env.VITE_ENTRA_ID_CLIENT_ID),
    'process.env.VITE_ENTRA_ID_TENANT_ID': JSON.stringify(process.env.VITE_ENTRA_ID_TENANT_ID),
  },
});
