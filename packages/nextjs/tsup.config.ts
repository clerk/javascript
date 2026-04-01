import type { Options } from 'tsup';
import { defineConfig } from 'tsup';

import { runAfterLast } from '../../scripts/utils';
// @ts-ignore
import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isProd = overrideOptions.env?.NODE_ENV === 'production';
  const shouldPublish = !!overrideOptions.env?.publish;

  const common: Options = {
    entry: [
      './src/**/*.{ts,tsx,js,jsx}',
      '!./src/**/*.test.{ts,tsx}',
      '!./src/**/server-actions.ts',
      '!./src/**/keyless-actions.ts',
      '!./src/vendor/**',
    ],
    // We want to preserve original file structure
    // so that the "use client" directives are not lost
    // and make debugging easier via node_modules easier
    bundle: false,
    clean: true,
    minify: false,
    external: ['#safe-node-apis'],
    sourcemap: true,
    legacyOutput: true,
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      __DEV__: `${!isProd}`,
    },
  };

  const esm: Options = {
    ...common,
    format: 'esm',
  };

  const cjs: Options = {
    ...common,
    format: 'cjs',
    outDir: './dist/cjs',
  };

  /**
   * When server actions are built with sourcemaps, Next.js does not resolve the sourcemap URLs during build and so browser dev tools attempt to load source maps for these files from incorrect locations
   */
  const serverActionsEsm: Options = {
    ...esm,
    entry: ['./src/**/server-actions.ts', './src/**/keyless-actions.ts'],
    sourcemap: false,
  };

  const serverActionsCjs: Options = {
    ...cjs,
    entry: ['./src/**/server-actions.ts', './src/**/keyless-actions.ts'],
    sourcemap: false,
  };

  /**
   * We vendor certain dependencies to control the output and minimize transitive dependency surface area.
   */
  const vendorsEsm: Options = {
    ...esm,
    bundle: true,
    minify: true,
    entry: ['./src/vendor/*.js'],
    outDir: './dist/esm/vendor',
    legacyOutput: false,
    outExtension: () => ({
      js: '.js',
    }),
    sourcemap: false,
  };

  const vendorsCjs: Options = {
    ...cjs,
    bundle: true,
    minify: true,
    entry: ['./src/vendor/*.js'],
    outDir: './dist/cjs/vendor',
    sourcemap: false,
  };

  const copyPackageJson = (format: 'esm' | 'cjs') => `cp ./package.${format}.json ./dist/${format}/package.json`;
  // Tsup will not output the generated file in the same location as the source file
  // So we need to move the server-actions.js file to the app-router folder manually
  // Happy to improve this if there is a better way
  const moveServerActions = (format: 'esm' | 'cjs') =>
    `mv ./dist/${format}/server-actions.js ./dist/${format}/app-router`;
  const moveKeylessActions = (format: 'esm' | 'cjs') =>
    `mv ./dist/${format}/keyless-actions.js ./dist/${format}/app-router`;

  return runAfterLast([
    'pnpm build:declarations',
    copyPackageJson('esm'),
    copyPackageJson('cjs'),
    moveServerActions('esm'),
    moveServerActions('cjs'),
    moveKeylessActions('esm'),
    moveKeylessActions('cjs'),
    shouldPublish && 'pkglab pub --ping',
  ])(esm, cjs, serverActionsEsm, serverActionsCjs, vendorsEsm, vendorsCjs);
});
