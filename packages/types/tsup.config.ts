import { defineConfig } from 'tsup';

export default defineConfig(() => {
  const uiRetheme = process.env.CLERK_RETHEME === '1' || process.env.CLERK_RETHEME === 'true';

  return {
    entry: {
      index: uiRetheme ? 'src/index.retheme.ts' : 'src/index.ts',
    },
    onSuccess: 'tsc',
    minify: false,
    clean: true,
    sourcemap: true,
    format: ['cjs', 'esm'],
    legacyOutput: true,
    dts: true,
  };
});
