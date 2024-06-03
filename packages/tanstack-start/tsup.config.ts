import type { Options } from 'tsup';
import { defineConfig } from 'tsup';

import { runAfterLast } from '../../scripts/utils';
import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isProd = overrideOptions.env?.NODE_ENV === 'production';
  const shouldPublish = !!overrideOptions.env?.publish;

  const config: Options = {
    entry: ['./src/**/*.{ts,tsx,js,jsx}', '!./src/**/*.test.{ts,tsx}'],
    bundle: false,
    clean: true,
    minify: false,
    sourcemap: true,
    legacyOutput: true,
    format: 'cjs',
    outDir: './dist',
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      __DEV__: `${!isProd}`,
    },
  };

  return runAfterLast(['npm run build:declarations', shouldPublish && 'npm run publish:local'])(config);
});
