import { defineConfig } from 'tsup';

// @ts-ignore
import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const shouldPublish = !!overrideOptions.env?.publish;

  return {
    clean: true,
    entry: [
      './src/index.ts',
      './src/react/index.ts',
      './src/client/index.ts',
      './src/server/index.ts',
      './src/internal/index.ts',
      './src/async-local-storage.client.ts',
      './src/async-local-storage.server.ts',
      './src/webhooks.ts',
      './src/types/index.ts',
    ],
    dts: true,
    minify: false,
    onSuccess: shouldPublish ? 'pnpm build:dts && pkglab pub --ping' : 'pnpm build:dts',
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
    },
    bundle: true,
    sourcemap: true,
    format: ['esm'],
    external: ['astro', 'react', 'react-dom', 'node:async_hooks', '#async-local-storage', 'astro:transitions/client'],
  };
});
