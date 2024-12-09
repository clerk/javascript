import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    reactRouter(),
    tsconfigPaths({
      projects: ['./tsconfig.json'],
    }),
  ],
  server: {
    port: Number(process.env.PORT),
  },
});
