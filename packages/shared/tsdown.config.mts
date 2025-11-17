import * as fs from 'node:fs';
import * as path from 'node:path';

import type { Options } from 'tsdown';
import { defineConfig } from 'tsdown';

import clerkJsPackage from '../clerk-js/package.json' with { type: 'json' };
import sharedPackage from './package.json' with { type: 'json' };

export default defineConfig(({ watch }) => {
  const common = {
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2022',
    platform: 'neutral',
    external: ['react', 'react-dom'],
    format: ['cjs', 'esm'],
    minify: false,
    define: {
      PACKAGE_NAME: `"${sharedPackage.name}"`,
      PACKAGE_VERSION: `"${sharedPackage.version}"`,
      JS_PACKAGE_VERSION: `"${clerkJsPackage.version}"`,
      __DEV__: `${watch}`,
      __CLERK_USE_RQ__: `${process.env.CLERK_USE_RQ === 'true'}`,
    },
  } satisfies Options;

  return [
    {
      ...common,
      entry: [
        //
        './src/types/index.ts',
      ],
      unbundle: false,
      outDir: './dist/types',
    },
    {
      ...common,
      entry: [
        './src/*.{ts,tsx}',
        './src/react/index.ts',
        './src/utils/index.ts',
        './src/workerTimers/index.ts',
        './src/types/index.ts',
        './src/dom/*.ts',
        '!./src/**/*.{test,spec}.{ts,tsx}',
      ],
      outDir: './dist/runtime',
      unbundle: false,
      plugins: [HookAliasPlugin()],
    },
  ];
});

const HookAliasPlugin = () => {
  const useRQ = process.env.CLERK_USE_RQ === 'true';
  const rqHooks = new Set((process.env.CLERK_RQ_HOOKS ?? '').split(',').filter(Boolean));
  const baseDir = process.cwd();

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
    // default to first candidate; bundler will emit a clear error if missing
    return candidates[0];
  };

  return {
    name: 'hook-alias-plugin',
    resolveId(id: string) {
      if (!id.startsWith('virtual:data-hooks/')) {
        return null;
      }
      return resolveImpl(id);
    },
  } as any;
};
