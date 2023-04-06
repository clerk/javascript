import { defineConfig } from 'tsup';

import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isProd = overrideOptions.env?.NODE_ENV === 'production';

  return {
    entry: [
      'src/index.ts',
      'src/ssr/index.ts',
      'src/server/index.ts',
      'src/api/index.ts',
      'src/middleware/index.ts',
      'src/app-beta/index.ts',
      'src/client/index.ts',
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
