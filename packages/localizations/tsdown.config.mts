import { defineConfig } from 'tsdown';

export default defineConfig(({ env, watch }) => {
  const shouldPublish = !!env?.publish;

  return {
    entry: ['src/*.ts'],
    format: ['cjs', 'esm'],
    fixedExtension: false,
    // Keep the previous build in place during watch rebuilds so downstream
    // dev servers never resolve package exports against an empty dist.
    clean: !watch,
    minify: false,
    sourcemap: true,
    dts: true,
    splitting: false,
    onSuccess: shouldPublish ? 'pkglab pub --ping' : undefined,
  };
});
