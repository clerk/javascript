import { defineConfig } from 'tsup';

import { name, version } from './package.json';

console.log({ name, version });
export default defineConfig(overrideOptions => {
  const isProd = overrideOptions.env?.NODE_ENV === 'production';

  return {
    entry: ['src/index.ts', 'src/instance.ts'],
    onSuccess: 'tsc',
    clean: true,
    // minify: isProd,
    minify: false,
    sourcemap: true,
    format: ['cjs', 'esm'],
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      __DEV__: `${!isProd}`,
    },
    external: [],
  };
});
