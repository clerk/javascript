import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

const clerkJsPath = resolve(__dirname, '../clerk-js/src');
const uiPath = resolve(__dirname, 'src');

function viteSvgMockPlugin() {
  return {
    name: 'svg-mock',
    transform(_code: string, id: string) {
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
      return undefined;
    },
  };
}

export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic', jsxImportSource: '@emotion/react' }), viteSvgMockPlugin()],
  define: {
    __BUILD_DISABLE_RHC__: JSON.stringify(false),
    __BUILD_VARIANT_CHIPS__: JSON.stringify(false),
    __PKG_NAME__: JSON.stringify('@clerk/ui'),
    __PKG_VERSION__: JSON.stringify('test'),
  },
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    globals: false,
    include: ['**/*.test.?(c|m)[jt]s?(x)', '**/*.spec.?(c|m)[jt]s?(x)'],
    exclude: ['node_modules/**', 'dist/**'],
    setupFiles: '../clerk-js/vitest.setup.mts',
    testTimeout: 5000,
  },
  resolve: {
    alias: [
      // UI package paths (local to this package)
      { find: /^@\/ui\//, replacement: `${uiPath}/` },
      // Test utilities from clerk-js
      { find: /^@\/test\//, replacement: `${clerkJsPath}/test/` },
      // Core modules from clerk-js
      { find: /^@\/core\//, replacement: `${clerkJsPath}/core/` },
      // Utils from clerk-js (for debug, etc. that clerk-js core depends on)
      { find: /^@\/utils\//, replacement: `${clerkJsPath}/utils/` },
      // Catch-all for other @/ imports - UI package
      { find: /^@\//, replacement: `${uiPath}/` },
    ],
  },
});
