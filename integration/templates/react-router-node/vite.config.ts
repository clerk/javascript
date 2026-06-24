import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ command }) => ({
  plugins: [
    reactRouter(),
    tsconfigPaths({
      projects: ['./tsconfig.json'],
    }),
  ],
  // Dev-only: `react-router dev` externalizes @clerk/react-router for SSR, so Node
  // loads it with a different react-router export condition (production) than Vite
  // gives the app (development). That yields two react-router instances and breaks
  // the Router context. noExternal routes Clerk through Vite so they share one
  // instance. Not applied to `build`, where bundling Clerk fails and the production
  // server resolves a single react-router instance anyway.
  ...(command === 'serve' ? { ssr: { noExternal: ['@clerk/react-router'] } } : {}),
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
}));
