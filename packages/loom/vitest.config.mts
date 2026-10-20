import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    projects: [
      { extends: true, test: { name: 'core', include: ['src/**/*.test.ts'] } },
      { extends: true, test: { name: 'react', environment: 'jsdom', include: ['src/**/*.test.tsx'] } },
    ],
  },
});
