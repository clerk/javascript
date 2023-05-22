import type { Options } from 'tsup';
import { defineConfig } from 'tsup';

// @ts-ignore
import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isProd = overrideOptions.env?.NODE_ENV === 'production';

  const common: Options = {
    entry: ['./src/**/*.{ts,tsx,js,jsx}'],
    // We want to preserve original file structure
    // so that the "use client" directives are not lost
    // and make debugging easier via node_modules easier
    bundle: false,
    clean: true,
    minify: false,
    sourcemap: true,
    legacyOutput: true,
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      __DEV__: `${!isProd}`,
    },
  };

  const onSuccess = (format: 'esm' | 'cjs') => `cp ./package.${format}.json ./dist/${format}/package.json`;

  const esm: Options = {
    ...common,
    format: 'esm',
    onSuccess: onSuccess('esm'),
  };

  const cjs: Options = {
    ...common,
    format: 'cjs',
    outDir: './dist/cjs',
    onSuccess: onSuccess('cjs'),
  };

  return [esm, cjs];
});
