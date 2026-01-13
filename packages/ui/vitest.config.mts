import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic', jsxImportSource: '@emotion/react' })],
  define: {
    __PKG_VERSION__: JSON.stringify('test'),
  },
  test: {
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{ts,tsx}'],
    globals: false,
  },
});
