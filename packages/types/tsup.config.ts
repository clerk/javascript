import { defineConfig } from 'tsup';

export default defineConfig(overrideOptions => {
  return {
    entry: {
      index: 'src/index.ts',
    },
    onSuccess: overrideOptions.watch ? 'pnpm build:declarations' : undefined,
    minify: false,
    clean: true,
    sourcemap: true,
    format: ['cjs', 'esm'],
    legacyOutput: true,
    dts: !overrideOptions.watch,
  };
});
