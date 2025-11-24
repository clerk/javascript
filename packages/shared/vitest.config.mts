import * as fs from 'node:fs';
import * as path from 'node:path';

import { defineConfig } from 'vitest/config';

function HookAliasPlugin() {
  return {
    name: 'hook-alias-plugin',
    resolveId(id: string) {
      if (!id.startsWith('virtual:data-hooks/')) {
        return null;
      }

      const name = id.replace('virtual:data-hooks/', '');
      const useRQ = process.env.CLERK_USE_RQ === 'true';
      const rqHooks = new Set((process.env.CLERK_RQ_HOOKS ?? '').split(',').filter(Boolean));
      const chosenRQ = rqHooks.has(name) || useRQ;
      const impl = `${name}.${chosenRQ ? 'rq' : 'swr'}.tsx`;

      const baseDirs = [process.cwd(), path.join(process.cwd(), 'packages', 'shared')];

      const candidates: string[] = [];
      for (const base of baseDirs) {
        candidates.push(
          path.join(base, 'src', 'react', 'hooks', impl),
          path.join(base, 'src', 'react', 'billing', impl),
          path.join(base, 'src', 'react', 'providers', impl),
        );
      }

      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          return candidate;
        }
      }
      return candidates[0];
    },
  } as any;
}

export default defineConfig({
  plugins: [HookAliasPlugin()],
  test: {
    watch: false,
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.test.json',
      include: ['**/*.type.{test,spec}.{ts,tsx}'],
    },
    env: {
      CLERK_SECRET_KEY: 'TEST_SECRET_KEY',
    },
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{ts,tsx}'],
    setupFiles: './vitest.setup.mts',
  },
});
