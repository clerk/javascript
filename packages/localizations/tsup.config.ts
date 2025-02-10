import { defineConfig } from 'tsup';

export default defineConfig(_overrideOptions => {
  return {
    entry: ['src/*.ts'],
    format: ['cjs', 'esm'],
    bundle: true,
    clean: true,
    minify: false,
    sourcemap: true,
    dts: true,
    splitting: false,
  };
});
