import { defineConfig } from 'tsup';

import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isProd = overrideOptions.env?.NODE_ENV === 'production';

  return {
    entry: ['src/ai-sdk/index.ts', 'src/langchain/index.ts'],
    dts: true,
    // onSuccess: 'tsc',
    minify: isProd,
    clean: true,
    sourcemap: true,
    format: ['cjs', 'esm'],
    // legacyOutput: true,
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      __DEV__: `${!isProd}`,
    },
  };
});
