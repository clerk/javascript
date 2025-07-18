import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

function viteSvgMockPlugin() {
  return {
    name: 'svg-mock',
    transform(code: string, id: string) {
      if (id.endsWith('.svg') && process.env.NODE_ENV === 'test') {
        return {
          code: `
            import React from 'react';
            const SvgMock = React.forwardRef((props, ref) => React.createElement('span', { ref, ...props }));
            export default SvgMock;
            export { SvgMock as ReactComponent };
          `,
          map: null,
        };
      }
    },
  };
}

export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic', jsxImportSource: '@emotion/react' }), viteSvgMockPlugin()],
  define: {
    __BUILD_VARIANT_CHIPS__: JSON.stringify(false),
    __PKG_NAME__: JSON.stringify('@clerk/clerk-js'),
    __PKG_VERSION__: JSON.stringify('test'),
  },
  test: {
    coverage: {
      provider: 'v8',
      enabled: true,
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/index.ts',
        'src/**/index.browser.ts',
        'src/**/index.chips.browser.ts',
        'src/**/index.headless.ts',
        'src/**/index.headless.browser.ts',
        'src/**/index.legacy.browser.ts',
        'src/**/coverage/**',
        'src/**/dist/**',
        'src/**/node_modules/**',
        'src/(ui|utils|core)/__tests__/**',
        'src/sandbox/**',
      ],
    },
    environment: 'jsdom',
    globals: false,
    include: ['**/*.spec.?(c|m)[jt]s?(x)'],
    exclude: ['sandbox/**/*.spec.?(c|m)[jt]s?(x)'],
    setupFiles: './vitest.setup.mts',
  },
  resolve: {
    alias: [{ find: /^@\//, replacement: `${resolve(__dirname, 'src')}/` }],
  },
});
