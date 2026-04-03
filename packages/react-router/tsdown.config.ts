import { defineConfig } from 'tsdown';

import clerkJsPackage from '../clerk-js/package.json' with { type: 'json' };
import pkgJson from './package.json' with { type: 'json' };

export default defineConfig(overrideOptions => {
  const isWatch = !!overrideOptions.watch;
  const shouldPublish = !!overrideOptions.env?.publish;

  return {
    format: 'esm',
    outDir: './dist',
    entry: ['./src/**/*.{ts,tsx,js,jsx}', '!./src/**/*.test.{ts,tsx}'],
    bundle: true,
    clean: true,
    dts: true,
    minify: false,
    sourcemap: true,
    onSuccess: shouldPublish ? 'pkglab pub --ping' : undefined,
    define: {
      PACKAGE_NAME: `"${pkgJson.name}"`,
      PACKAGE_VERSION: `"${pkgJson.version}"`,
      JS_PACKAGE_VERSION: `"${clerkJsPackage.version}"`,
      __DEV__: `${isWatch}`,
    },
  };
});
