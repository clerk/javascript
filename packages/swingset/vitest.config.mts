import { resolve } from 'node:path';

import { mergeConfig } from 'vitest/config';

import mosaicConfig from '../mosaic/vitest.config.mts';

export default mergeConfig(mosaicConfig, {
  oxc: {
    jsx: { runtime: 'automatic' },
  },
  resolve: {
    alias: {
      '@clerk/mosaic': resolve(import.meta.dirname, '../mosaic/src'),
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
});
