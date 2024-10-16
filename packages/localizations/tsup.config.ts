import { defineConfig } from 'tsup';

export default defineConfig(_overrideOptions => {
  return {
    entry: ['src/*.ts'],
    format: ['cjs', 'esm'],
    bundle: true,
    clean: true,
    minify: false,
    sourcemap: false,
    dts: true,
    splitting: false,
  };
});
