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
      'react/common/index': 'src/react/common/index.ts',
      'react/sign-in/index': 'src/react/sign-in/index.ts',
      'react/sign-up/index': 'src/react/sign-up/index.ts',
    },
    external: ['react', 'react-dom', 'next', '@statelyai/inspect'],
    format: ['cjs', 'esm'],
    minify: false,
    sourcemap: false,
  };
});
