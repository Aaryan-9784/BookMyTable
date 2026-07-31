import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite config — React plugin; API URL comes from VITE_API_URL in .env
 */
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
