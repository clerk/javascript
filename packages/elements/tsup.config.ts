import { defineConfig } from 'tsup';

// @ts-expect-error - JSON file
import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isProd = overrideOptions.env?.NODE_ENV === 'production';

  return {
    entry: ['src/index.tsx'],
    minify: false,
    clean: true,
    sourcemap: true,
    format: ['cjs', 'esm'],
    legacyOutput: true,
    dts: true,
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      __DEV__: `${!isProd}`,
    },
  };
});
