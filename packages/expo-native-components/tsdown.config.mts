import type { Options } from 'tsdown';
import { defineConfig } from 'tsdown';

import { runAfterLast } from '../../scripts/utils.ts';

function preserveRelativeImports(id: string) {
  return id.startsWith('.');
}

export default defineConfig(overrideOptions => {
  const isWatch = !!overrideOptions.watch;
  const shouldPublish = !!overrideOptions.env?.publish;

  const options: Options = {
    format: 'cjs',
    fixedExtension: false,
    outDir: './dist',
    entry: ['./src/**/*.{ts,tsx,js,jsx}', '!./src/**/*.test.{ts,tsx,js}', '!./src/**/__tests__/**'],
    unbundle: true,
    clean: true,
    minify: false,
    sourcemap: true,
    deps: {
      // Keep relative import specifiers unchanged so Metro can apply platform-specific resolution.
      neverBundle: preserveRelativeImports,
    },
    define: {
      __DEV__: `${isWatch}`,
    },
  };

  return runAfterLast(['pnpm build:declarations', shouldPublish && 'pkglab pub --ping'])(options);
});
