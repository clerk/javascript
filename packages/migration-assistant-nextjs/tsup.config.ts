import type { Options } from 'tsup';
import { defineConfig } from 'tsup';

import { runAfterLast } from '../../scripts/utils';
import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isProd = overrideOptions.env?.NODE_ENV === 'production';
  const shouldPublish = !!overrideOptions.env?.publish;

  const common: Options = {
    entry: ['./src/**/*.{ts,tsx,js,jsx}', '!./src/**/*.test.{ts,tsx}', '!./src/**/server-actions.ts'],
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

  // Tsup will not output the generated file in the same location as the source file

  return runAfterLast(['npm run build:declarations', shouldPublish && 'npm run publish:local'])(common);
});
