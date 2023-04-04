import { defineConfig } from 'tsup';

import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isProd = overrideOptions.env?.NODE_ENV === 'production';

  return {
    clean: true,
    entry: [
      'src/index.ts',
      'src/ssr/index.ts',
      'src/server/index.ts',
      'src/api/index.ts',
      'src/edge-middleware/index.ts',
      'src/app-beta/index.ts',
      'src/constants.ts',
    ],
    onSuccess: 'tsc --emitDeclarationOnly --declaration',
    minify: isProd,
    sourcemap: true,
    format: ['cjs', 'esm'],
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      __DEV__: `${!isProd}`,
    },
    legacyOutput: true,
  };
});
