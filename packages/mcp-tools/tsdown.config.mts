import { defineConfig } from 'tsdown';

export default defineConfig(overrideOptions => {
  const shouldPublish = !!overrideOptions.env?.publish;

  return {
    entry: {
      index: './src/index.ts',
      hono: './src/hono.ts',
      express: './src/express.ts',
      next: './src/next.ts',
    },
    format: ['cjs', 'esm'],
    fixedExtension: false,
    clean: true,
    minify: false,
    sourcemap: true,
    dts: true,
    onSuccess: shouldPublish ? 'pkglab pub --ping' : undefined,
  };
});
