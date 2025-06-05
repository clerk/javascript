import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic', jsxImportSource: '@emotion/react' })],
  define: {
    __PKG_NAME__: JSON.stringify('@clerk/clerk-js'),
  },
  test: {
    include: ['**/*.spec.?(c|m)[jt]s?(x)'],
    environment: 'jsdom',
    setupFiles: './vitest.setup.mts',
  },
});
