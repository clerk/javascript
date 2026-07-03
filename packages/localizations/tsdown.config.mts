import { defineConfig } from 'tsdown';

export default defineConfig(overrideOptions => {
  const shouldPublish = !!overrideOptions.env?.publish;

  return {
    entry: ['src/*.ts'],
    format: ['cjs', 'esm'],
    fixedExtension: false,
    clean: true,
    minify: false,
    sourcemap: true,
    dts: true,
    splitting: false,
    onSuccess: shouldPublish ? 'pkglab pub --ping' : undefined,
  };
});
