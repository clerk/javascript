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
    format: 'esm',
    outDir: './dist',
    dts: true,
    // @ts-expect-error - Type issue from the esbuild-plugin-file-path-extensions
    esbuildPlugins: [esbuildPluginFilePathExtensions({ esmExtension: 'js' })],
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      __DEV__: `${!isProd}`,
    },
    external: ['vinxi/http'],
  };

  return runAfterLast([
    // 'pnpm build:declarations',
    shouldPublish && 'pkglab pub --ping',
  ])(common);
});
