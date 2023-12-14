import { defineConfig } from 'tsup';

// @ts-ignore
import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isWatch = !!overrideOptions.watch;
  const shouldPublish = !!overrideOptions.env?.publish;

  return {
    entry: ['src/index.ts', 'src/errors.ts', 'src/internal.ts'],
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      __DEV__: `${isWatch}`,
    },
    onSuccess: shouldPublish ? 'npm run publish:local' : undefined,
    format: ['cjs', 'esm'],
    bundle: true,
    sourcemap: true,
    clean: true,
    minify: false,
    dts: true,
  };
});
