import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite config — React plugin; API URL comes from VITE_API_URL in .env
 *
 * amazon-cognito-identity-js → buffer@4 uses the identifier `global`, which does not
 * exist in browsers → ReferenceError and a blank white screen. Map it to globalThis.
 */
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['amazon-cognito-identity-js', 'buffer'],
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
