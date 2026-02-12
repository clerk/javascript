import svgr from '@svgr/rollup';
import type { Options } from 'tsdown';
import { defineConfig } from 'tsdown';

import uiPackage from './package.json' with { type: 'json' };

export default defineConfig(({ watch }) => {
  const common = {
    dts: true,
    sourcemap: true,
    clean: false,
    target: 'es2022',
    platform: 'browser',
    external: ['react', 'react-dom', '@clerk/localizations', '@clerk/shared'],
    format: ['esm'], // ESM only
    minify: false,
    plugins: [
      svgr({
        svgoConfig: {
          plugins: ['preset-default', 'removeDimensions', 'removeStyleElement'],
        },
      }),
    ],
    define: {
      PACKAGE_NAME: `"${uiPackage.name}"`,
      PACKAGE_VERSION: `"${uiPackage.version}"`,
      __DEV__: `${watch}`,
      __BUILD_DISABLE_RHC__: JSON.stringify(false),
    },
  } satisfies Options;

  return [
    {
      ...common,
      entry: [
        './src/index.ts',
        './src/entry.ts',
        './src/server.ts',
        './src/internal/index.ts',
        './src/themes/index.ts',
        './src/themes/experimental.ts',
      ],
      outDir: './dist',
      unbundle: true,
      onSuccess: async () => {
        // Copy CSS files from src/themes to dist/themes
        const { cp, mkdir } = await import('fs/promises');
        const { join } = await import('path');
        await mkdir('./dist/themes', { recursive: true });
        try {
          await cp(join('./src/themes/shadcn.css'), join('./dist/themes/shadcn.css'));
          console.log('✓ Copied shadcn.css');
        } catch (error) {
          console.warn('⚠ Warning: Failed to copy CSS files:', error);
        }
      },
    },
  ];
});
