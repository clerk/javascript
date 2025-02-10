import { join } from 'node:path';

import { run } from 'jscodeshift/src/Runner.js';

/**
 *
 * @param {string} transform
 * @param {string[]} paths
 */
export async function applyCodemod(transform, paths) {
  const pathToTransform = join(import.meta.dirname, 'transforms', transform);
  return await run(pathToTransform, paths, {
    ignorePattern: ['**/node_modules/**', '**/dist/**'],
    extensions: 'tsx,ts,jsx,js',
    parser: 'tsx',
    silent: true,
    runInBand: true,
  });
}
