import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  './integration/templates/tanstack-router/vite.config.js',
  './integration/templates/react-vite/vite.config.ts',
  './integration/templates/express-vite/vite.config.ts',
  './packages/nextjs/vitest.config.mts',
  './packages/upgrade/vitest.config.js',
  './packages/ui/vitest.config.mts',
  './playground/chrome-extension/vite.config.ts',
  './playground/vite-react-ts/vite.config.ts',
]);
