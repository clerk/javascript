import { defineConfig } from 'tsup';

// @ts-ignore
import { name } from './package.json';

export default defineConfig(overrideOptions => {
  const isWatch = !!overrideOptions.watch;

  return {
    entry: ['./src/**/*.{ts,js}'],
    outDir: 'tests/dist/',
    define: {
      PACKAGE_NAME: `"${name}"`,
      // use "test" instead of actual package version to avoid updating the tests
      // depending on it (eg userAgent related) on every version bump
      PACKAGE_VERSION: `"0.0.0-test"`,
      __DEV__: `${isWatch}`,
    },
    external: ['#crypto', '#ephemeral'],
    clean: true,
    minify: false,
    tsconfig: 'tsconfig.test.json',
    format: 'cjs',
  };
});
