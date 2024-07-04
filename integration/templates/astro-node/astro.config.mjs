import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import clerk from '@clerk/astro';
import { loadEnv } from 'vite';
import react from '@astrojs/react';

import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [clerk(), react(), tailwind()],
  // server: {
  //   port:  (() => {
  //     console.log("-asstro",loadEnv(process.env.NODE_ENV, process.cwd(), "").PORT)
  //     return 39333
  //   })()
  // }
  server: {
    port: Number(process.env.PORT),
  },
});
