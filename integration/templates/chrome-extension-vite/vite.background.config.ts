import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'src/background.ts'),
        output: {
          entryFileNames: 'background.js',
          format: 'es',
          // Prevent code splitting — background must be a single file
          manualChunks: undefined,
        },
      },
      outDir: 'dist',
      emptyOutDir: false,
    },
    define: {
      'globalThis.__CLERK_PUBLISHABLE_KEY__': JSON.stringify(env.VITE_CLERK_PUBLISHABLE_KEY || ''),
    },
  };
});
