import { defineConfig } from 'tsup';

import { version as clerkJsVersion } from '../clerk-js/package.json';
import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isProd = overrideOptions.env?.NODE_ENV === 'production';

  return {
    clean: true,
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      JS_PACKAGE_VERSION: `"${clerkJsVersion}"`,
      __DEV__: `${!isProd}`,
    },
    dts: true,
    entry: {
      index: 'src/index.ts',
    },
    external: ['react', 'react-dom'],
    format: ['cjs', 'esm'],
    minify: false,
    sourcemap: true,
  };
});
