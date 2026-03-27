import { defineConfig } from 'tsdown';

import pkgJson from './package.json' with { type: 'json' };

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
    sourcemap: true,
    format: 'esm',
    onSuccess: shouldPublish ? 'pkglab pub --ping' : undefined,
    define: {
      PACKAGE_NAME: `"${pkgJson.name}"`,
      PACKAGE_VERSION: `"${pkgJson.version}"`,
      __DEV__: `${!isProd}`,
    },
  };
});
