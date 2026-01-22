import { defineConfig } from 'tsup';

import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isProd = overrideOptions.env?.NODE_ENV === 'production';

  return {
    entry: ['src/index.ts', 'src/applications.ts', 'src/domains.ts', 'src/transfers.ts'],
    dts: true,
    clean: true,
    bundle: true,
    sourcemap: true,
    treeshake: true,
    format: ['esm', 'cjs'],
    minify: false,
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      __DEV__: `${!isProd}`,
    },
  };
});
