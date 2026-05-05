import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  define: {
    // Chrome extensions don't have `global` — alias it to globalThis
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
      },
    },
    outDir: 'dist',
  },
});
