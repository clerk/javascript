import type { Options } from 'tsup';
import { defineConfig } from 'tsup';

import { runAfterLast } from '../../scripts/utils';

export default defineConfig(() => {
  const options: Options = {
    format: 'cjs',
    outDir: './dist',
    entry: ['./src/**/*.{ts,tsx,js,jsx}', '!./src/**/__tests__/**'],
    bundle: false,
    clean: true,
    minify: false,
    sourcemap: true,
    legacyOutput: true,
  };

  return runAfterLast(['pnpm build:declarations'])(options);
});
