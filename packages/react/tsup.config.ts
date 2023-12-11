import { defineConfig } from 'tsup';

// @ts-expect-error for `import module with '.json' extension`
import { version as clerkJsVersion } from '../clerk-js/package.json';
// @ts-expect-error for `import module with '.json' extension`
import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isWatch = !!overrideOptions.watch;
  const shouldPublish = !!overrideOptions.env?.publish;

  return {
    entry: {
      index: 'src/index.ts',
    },
    onSuccess: ['tsc --noEmit', shouldPublish ? 'npm run publish:local' : undefined].filter(Boolean).join(' && '),
    format: ['cjs', 'esm'],
    bundle: true,
    clean: true,
    minify: false,
    sourcemap: true,
    dts: true,
    external: ['react', 'react-dom'],
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      JS_PACKAGE_VERSION: `"${clerkJsVersion}"`,
      __DEV__: `${isWatch}`,
    },
  };
});
