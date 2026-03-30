import { defineConfig, type Options } from 'tsdown';

import pkgJson from './package.json' with { type: 'json' };

export default defineConfig(overrideOptions => {
  const isProd = overrideOptions.env?.NODE_ENV === 'production';
  const shouldPublish = !!overrideOptions.env?.publish;

  const common: Options = {
    entry: ['./src/**/*.{ts,tsx,js,jsx}', '!./src/**/*.test.{ts,tsx}'],
    bundle: true,
    clean: true,
    minify: false,
    sourcemap: true,
    treeshake: true,
    format: 'esm',
    outDir: './dist',
    dts: true,
    define: {
      PACKAGE_NAME: `"${pkgJson.name}"`,
      PACKAGE_VERSION: `"${pkgJson.version}"`,
      __DEV__: `${!isProd}`,
    },
    external: ['vinxi/http'],
  };

  return {
    ...common,
    ...(shouldPublish ? { onSuccess: 'pkglab pub --ping' } : {}),
  };
});
