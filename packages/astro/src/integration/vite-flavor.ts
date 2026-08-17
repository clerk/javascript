import { createRequire } from 'node:module';

/**
 * Vite 8 and `rolldown-vite` prebundle dependencies with Rolldown and deprecate
 * `optimizeDeps.esbuildOptions`, which is also no longer able to carry a `target`.
 */
export function usesRolldownDepOptimizer(): boolean {
  try {
    const require = createRequire(import.meta.url);
    const astroRequire = createRequire(require.resolve('astro/package.json'));
    const { name, version } = astroRequire('vite/package.json');
    return name === 'rolldown-vite' || Number.parseInt(version, 10) >= 8;
  } catch {
    return false;
  }
}
