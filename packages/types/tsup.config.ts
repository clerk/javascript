import { defineConfig } from 'tsup';

export default defineConfig(() => {
  return {
    entry: {
      index: 'src/index.ts',
    },
    minify: false,
    clean: true,
    sourcemap: false,
    format: ['cjs', 'esm'],
    legacyOutput: true,
    dts: true,
  };
});
