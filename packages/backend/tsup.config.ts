import type { Options } from 'tsup';
import { defineConfig } from 'tsup';

// @ts-ignore
import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isProd = overrideOptions.env?.NODE_ENV === 'production';
  const isWatch = !!overrideOptions.watch;

  const common: Options = {
    entry: ['./src/**/*.{ts,tsx,js,jsx}', '!./src/runtime/node', '!./src/runtime/browser'],
    bundle: false,
    clean: true,
    minify: false,
    sourcemap: true,
    legacyOutput: true,
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      __DEV__: `${!isProd}`,
    },
    external: ['#crypto', '#fetch'],
  };

  const onSuccess = (format: 'esm' | 'cjs') => {
    const rsync = `rsync -r --include '*/' --include '*.js' --include '*.mjs' --exclude='*' ./src/runtime ./dist/${format}/`;
    return `cp ./package.${format}.json ./dist/${format}/package.json && ${rsync}`;
  };

  const esm: Options = {
    ...common,
    format: 'esm',
    onSuccess: onSuccess('esm'),
  };

  const cjs: Options = {
    ...common,
    format: 'cjs',
    outDir: './dist/cjs',
    onSuccess: onSuccess('cjs'),
  };

  return runAfterLast(['npm run build:declarations', isWatch && 'npm run publish:local'])(esm, cjs);
});

const runAfterLast =
  (commands: Array<string | false>) =>
  (...configs: Options[]) => {
    const [last, ...rest] = configs.reverse();
    return [...rest.reverse(), { ...last, onSuccess: [last.onSuccess, ...commands].filter(Boolean).join(' && ') }];
  };
