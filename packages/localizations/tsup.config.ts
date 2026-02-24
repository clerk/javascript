import { defineConfig } from 'tsup';

export default defineConfig(overrideOptions => {
  const shouldPublish = !!overrideOptions.env?.publish;

  return {
    entry: ['src/*.ts'],
    format: ['cjs', 'esm'],
    bundle: true,
    clean: true,
    minify: false,
    sourcemap: true,
    dts: true,
    splitting: false,
    onSuccess: shouldPublish ? 'pkglab pub --ping' : undefined,
  };
});
