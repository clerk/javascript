import type { Options } from 'tsup';
import { defineConfig } from 'tsup';

// @ts-expect-error for `import module with '.json' extension`
import { version as clerkJsVersion } from '../clerk-js/package.json';
// @ts-expect-error for `import module with '.json' extension`
import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isWatch = !!overrideOptions.watch;
  const shouldPublish = !!overrideOptions.env?.publish;

  const common: Options = {
    dts: true,
    onSuccess: shouldPublish ? 'npm run publish:local' : undefined,
    format: ['cjs', 'esm'],
    bundle: true,
    clean: true,
    minify: false,
    sourcemap: true,
    external: ['react', 'react-dom'],
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      JS_PACKAGE_VERSION: `"${clerkJsVersion}"`,
      __DEV__: `${isWatch}`,
      __OMIT_REMOTE_HOSTED_CODE__: 'false',
    },
  };

  // Default output
  const core: Options = {
    ...common,
    entry: {
      index: 'src/index.ts',
      internal: 'src/internal.ts',
      errors: 'src/errors.ts',
    },
  };

  // Default output without remote hosted code (used in browser extensions)
  const withoutRemoteHostedCode: Options = {
    ...common,
    treeshake: true,
    entry: {
      'browser-extension': 'src/index.ts',
    },
    define: {
      ...common.define,
      __OMIT_REMOTE_HOSTED_CODE__: 'true',
    },
  };

  return [core, withoutRemoteHostedCode];
});
