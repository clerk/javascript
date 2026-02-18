import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import clerk from '@clerk/astro';
import react from '@astrojs/react';

export default defineConfig({
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
  ],
  server: {
    port: Number(process.env.PORT),
  },
});
