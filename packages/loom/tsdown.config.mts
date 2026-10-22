import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    react: 'src/react.tsx',
    clerk: 'src/clerk.ts',
    server: 'src/server.ts',
    nextjs: 'src/nextjs.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  target: 'es2022',
  platform: 'neutral',
});
