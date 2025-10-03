import type { Plugin } from 'esbuild';
import * as esbuild from 'esbuild';
import * as fs from 'fs';
import { readFile } from 'fs/promises';
import * as path from 'path';
import { defineConfig } from 'tsup';

// @ts-ignore - resolved by tsup build (resolveJsonModule not needed at type time)
import { version as clerkJsVersion } from '../clerk-js/package.json';
// @ts-ignore - resolved by tsup build
import { name, version } from './package.json';

export default defineConfig(overrideOptions => {
  const isWatch = !!overrideOptions.watch;

  return {
    entry: [
      './src/*.{ts,tsx}',
      './src/react/index.ts',
      './src/utils/index.ts',
      './src/workerTimers/index.ts',
      './src/dom/*.ts',
      '!./src/**/*.test.{ts,tsx}',
    ],
    format: ['cjs', 'esm'],
    bundle: true,
    clean: true,
    minify: false,
    sourcemap: true,
    dts: true,
    target: 'es2022',
    external: ['react', 'react-dom'],
    esbuildPlugins: [WebWorkerMinifyPlugin as any, HookAliasPlugin() as any],
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
      JS_PACKAGE_VERSION: `"${clerkJsVersion}"`,
      __DEV__: `${isWatch}`,
      __USE_RQ__: JSON.stringify(process.env.CLERK_USE_RQ === 'true'),
    },
  };
});

// Read transform and minify any files ending in .worker.ts
// These files can be imported as modules and used as string when instantiating
// a new web worker, without loading an external file during runtime
export const WebWorkerMinifyPlugin: Plugin = {
  name: 'WebWorkerMinifyPlugin',
  setup(build) {
    build.onLoad({ filter: /\.worker\.ts/ }, async args => {
      const f = await readFile(args.path);
      const js = await esbuild.transform(f, { loader: 'ts', minify: true });
      return { loader: 'text', contents: js.code };
    });
  },
};

const HookAliasPlugin = (): Plugin => {
  const useRQ = process.env.CLERK_USE_RQ === 'true';
  const rqHooks = new Set((process.env.CLERK_RQ_HOOKS ?? '').split(',').filter(Boolean));
  const baseDir = __dirname; // packages/shared

  const resolveImpl = (specifier: string) => {
    const name = specifier.replace('virtual:data-hooks/', '');
    const chosenRQ = rqHooks.has(name) || useRQ;
    const impl = chosenRQ ? `${name}.rq.tsx` : `${name}.swr.tsx`;

    const candidates = name.toLowerCase().includes('provider')
      ? [path.join(baseDir, 'src', 'react', 'providers', impl), path.join(baseDir, 'src', 'react', 'hooks', impl)]
      : [path.join(baseDir, 'src', 'react', 'hooks', impl), path.join(baseDir, 'src', 'react', 'providers', impl)];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
    // default to first candidate; esbuild will emit a clear error if missing
    return candidates[0];
  };

  return {
    name: 'hook-alias-plugin',
    setup(build) {
      build.onResolve({ filter: /^virtual:data-hooks\// }, args => {
        const resolved = resolveImpl(args.path);
        return { path: resolved };
      });
    },
  };
};
