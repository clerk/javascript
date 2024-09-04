import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './testSetup.js',
    includeSource: ['**/*.{js,ts,jsx,tsx}'],
    alias: {
      '~/': new URL('./src/', import.meta.url).pathname,
    },
  },
});
