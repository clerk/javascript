import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import viteReact from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStart(),
    tailwindcss(),
    viteReact(),
  ],
  // See https://github.com/TanStack/router/issues/5738
  resolve: {
    alias: [
      {
        find: 'use-sync-external-store/shim/index.js',
        replacement: 'react',
      },
    ],
  },
});
