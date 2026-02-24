import { defineConfig } from 'tsup';

import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isProd = overrideOptions.env?.NODE_ENV === 'production';
  const shouldPublish = !!overrideOptions.env?.publish;

  return {
    entry: [
      'src/ai-sdk/index.ts',
      'src/langchain/index.ts',
      'src/modelcontextprotocol/index.ts',
      'src/modelcontextprotocol/local-server.ts',
    ],
    dts: true,
    clean: true,
    bundle: true,
    sourcemap: true,
    format: 'esm',
    onSuccess: shouldPublish ? 'pkglab pub --ping' : undefined,
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      __DEV__: `${!isProd}`,
    },
  };
});
