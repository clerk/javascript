import { defineConfig } from 'astro/config';
import clerk from '@clerk/astro';
import react from '@astrojs/react';

export default defineConfig({
  output: 'hybrid',
  integrations: [clerk(), react()],
  server: {
    port: Number(process.env.PORT),
  },
});
