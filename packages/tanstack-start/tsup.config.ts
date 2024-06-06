import { esbuildPluginFilePathExtensions } from 'esbuild-plugin-file-path-extensions';
import type { Options } from 'tsup';
import { defineConfig } from 'tsup';

import { runAfterLast } from '../../scripts/utils';
// @ts-ignore
import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isProd = overrideOptions.env?.NODE_ENV === 'production';
  const shouldPublish = !!overrideOptions.env?.publish;

  const common: Options = {
    entry: ['./src/**/*.{ts,tsx,js,jsx}', '!./src/**/*.test.{ts,tsx}'],
    bundle: true,
    clean: true,
    minify: false,
    sourcemap: true,
    treeshake: true,
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      __DEV__: `${!isProd}`,
    },
  };

  const esm: Options = {
    ...common,
    format: 'esm',
    outDir: './dist/esm',
    dts: true,
    esbuildPlugins: [esbuildPluginFilePathExtensions({ esmExtension: 'js' })],
  };

  const cjs: Options = {
    ...common,
    format: 'cjs',
    outDir: './dist/cjs',
    dts: true,
    esbuildPlugins: [esbuildPluginFilePathExtensions({ esmExtension: 'cjs' })],
  };

  return runAfterLast([
    // 'npm run build:declarations',
    shouldPublish && 'npm run publish:local',
  ])(esm, cjs);
});
