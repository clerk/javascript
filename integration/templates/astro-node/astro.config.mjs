import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import clerk from '@clerk/astro';
import react from '@astrojs/react';

import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [clerk(), react(), tailwind()],
  server: {
    port: Number(process.env.PORT),
  },
  vite: {
    optimizeDeps: {
      // Fix "Outdated Optimize Dep" error in Vite.
      // This only happens in our test environment.
      exclude: ['@clerk/astro/internal'],
    },
  },
});
