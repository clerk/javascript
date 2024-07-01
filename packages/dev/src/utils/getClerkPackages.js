import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

import { glob } from 'glob';

/**
 *
 * @returns {Promise<Record<string, string>>}
 */
export async function getClerkPackages() {
  const monorepoRoot = resolve(join(import.meta.dirname, '..', '..', '..', '..'));
  /** @type {Record<string, string>} */
  const packages = {};
  const clerkPackages = await glob(join(monorepoRoot, 'packages', '*', 'package.json'), {
    ignore: '**/node_modules/**',
  });
  for (const packageJSON of clerkPackages) {
    const { name } = JSON.parse(await readFile(packageJSON, 'utf-8'));
    if (name) {
      packages[name] = dirname(packageJSON);
    }
  }

  return packages;
}
