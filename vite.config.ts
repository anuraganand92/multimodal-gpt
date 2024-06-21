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
        target: 'https://flask-testing123.azurewebsites.net',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});