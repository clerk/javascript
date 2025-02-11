import { defineConfig } from 'tsup';

// @ts-ignore
import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isProd = overrideOptions.env?.NODE_ENV === 'production';

  return {
    entry: ['src/playwright/index.ts', 'src/cypress/index.ts', 'src/index.ts'],
    onSuccess: 'tsc',
    minify: isProd,
    clean: true,
    sourcemap: !isProd,
    format: ['cjs', 'esm'],
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      __DEV__: `${!isProd}`,
    },
  };
});
