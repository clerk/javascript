import type { Plugin } from 'esbuild';
import { defineConfig } from 'tsup';

import { version as clerkJsVersion } from '../clerk-js/package.json';
import { name, version } from './package.json';

/**
 * Replaces the inspect with undefined so-as not to bundle
 * inspectors outside of our development environment.
 */
export function dynamicInspectorImport(): Plugin {
  return {
    name: 'dynamicInspectorImport',
    setup(build) {
      build.onLoad({ filter: /\/inspector\/index.ts/ }, async () => {
        return {
          contents: 'export const inspect = undefined;',
          loader: 'ts',
        };
      });
    },
  };
}

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
    external: ['react', 'react-dom', '@statelyai/inspect'],
    format: ['cjs', 'esm'],
    minify: false,
    sourcemap: true,
    esbuildPlugins: isProd ? [dynamicInspectorImport()] : [],
  };
});
