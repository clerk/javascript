import { defineConfig } from 'tsup';

import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isProd = overrideOptions.env?.NODE_ENV === 'production';

  return {
    entry: ['src/cli.ts'],
    dts: false,
    clean: true,
    bundle: true,
    sourcemap: true,
    format: 'esm',
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      __DEV__: `${!isProd}`,
    },
    banner: {
      js: '#!/usr/bin/env node',
    },
  };
});
