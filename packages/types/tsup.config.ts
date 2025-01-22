import { defineConfig } from 'tsup';

export default defineConfig(overrideOptions => {
  const isProd = overrideOptions.env?.NODE_ENV === 'production';

  return {
    entry: {
      index: 'src/index.ts',
    },
    minify: false,
    clean: true,
    sourcemap: !isProd,
    format: ['cjs', 'esm'],
    legacyOutput: true,
    dts: true,
  };
});
