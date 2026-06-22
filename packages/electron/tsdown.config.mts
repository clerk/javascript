import { defineConfig } from 'tsdown';

import pkgJson from './package.json' with { type: 'json' };

export default defineConfig(overrideOptions => {
  const isWatch = !!overrideOptions.watch;
  const shouldPublish = !!overrideOptions.env?.publish;

  return {
    entry: {
      index: './src/index.ts',
      'preload/index': './src/preload/index.ts',
      'react/index': './src/react/index.tsx',
      'storage/index': './src/storage/index.ts',
      'passkeys/index': './src/passkeys/index.ts',
    },
    clean: true,
    deps: {
      neverBundle: ['@clerk/electron-passkeys'],
    },
    dts: true,
    fixedExtension: false,
    format: ['cjs', 'esm'],
    minify: false,
    outDir: './dist',
    sourcemap: true,
    treeshake: true,
    define: {
      PACKAGE_NAME: `"${pkgJson.name}"`,
      PACKAGE_VERSION: `"${pkgJson.version}"`,
      __DEV__: `${isWatch}`,
    },
    onSuccess: shouldPublish ? 'pkglab pub --ping' : undefined,
  };
});
