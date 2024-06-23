import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import history from 'connect-history-api-fallback';

const backendUrl = process.env.VITE_AZURE_BACKEND_URL;
const storageAccountName = process.env.VITE_AZURE_STORAGE_ACCOUNT_NAME;
const containerName = process.env.VITE_AZURE_CONTAINER_NAME;
const sasToken = process.env.VITE_AZURE_SAS_TOKEN;

if (!backendUrl || !storageAccountName || !containerName || !sasToken) {
  throw new Error("Missing required environment variables");
}

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
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});