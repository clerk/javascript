import { defineConfig } from '@rslib/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';

import packageJSON from './package.json';

export default defineConfig({
  source: {
    define: {
      __DEV__: false,
      __PKG_NAME__: JSON.stringify(packageJSON.name),
      __PKG_VERSION__: JSON.stringify(packageJSON.version),
      __BUILD_FLAG_KEYLESS_UI__: false,
      __BUILD_DISABLE_RHC__: JSON.stringify('false'),
      __BUILD_VARIANT_CHIPS__: false,
      'process.env.CLERK_ENV': JSON.stringify('production'),
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
  },
  lib: [
    {
      format: 'esm',
      bundle: false,
      output: { distPath: { root: './dist/esm' } },
    },
  ],
  output: {
    target: 'web',
  },
  plugins: [
    pluginSvgr({ svgrOptions: { exportType: 'default' } }),
    pluginReact({
      swcReactOptions: {
        runtime: 'automatic',
        importSource: '@emotion/react',
        development: false,
        refresh: false,
      },
    }),
  ],
});
