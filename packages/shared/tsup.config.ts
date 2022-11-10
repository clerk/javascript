import { defineConfig } from 'tsup';

// @ts-expect-error
import { version } from './package.json';

export default defineConfig(overrideOptions => {
  const isProd = overrideOptions.env?.NODE_ENV === 'production';

  return {
    entry: ['src/index.ts', 'src/testUtils/index.ts'],
    onSuccess: 'tsc',
    minify: isProd,
    clean: true,
    sourcemap: true,
    format: ['cjs', 'esm'],
    define: { PACKAGE_VERSION: `"${version}"`, __DEV__: `${!isProd}` },
    external: ['@testing-library', 'react', 'react-dom', 'react-test-renderer'],
  };
});
