import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://baratosociais.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/v2'), // Maps /api to /api/v2 on the target
      },
    },
  },
});