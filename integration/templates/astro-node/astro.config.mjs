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
  integrations: [
    clerk({
      appearance: {
        options: {
          showOptionalFields: true,
        },
      },
    }),
    react(),
    tailwind(),
  ],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
});
