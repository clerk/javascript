import { defineConfig } from 'astro/config';
import clerk from '@clerk/astro';
import react from '@astrojs/react';

export default defineConfig({
  output: 'hybrid',
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
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
});
