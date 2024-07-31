import { readFile } from 'node:fs/promises';
import { dirname, posix } from 'node:path';

import { globby } from 'globby';

import { getMonorepoRoot } from './getMonorepoRoot.js';

/**
 * Generates an object with keys of package names and values of absolute paths to the package folder.
 * @returns {Promise<Record<string, string>>}
 */
export async function getClerkPackages() {
  const monorepoRoot = await getMonorepoRoot();
  /** @type {Record<string, string>} */
  const packages = {};
  const clerkPackages = await globby([posix.join(monorepoRoot, 'packages', '*', 'package.json'), '!*node_modules*']);
  for (const packageJSON of clerkPackages) {
    const { name } = JSON.parse(await readFile(packageJSON, 'utf-8'));
    if (name) {
      packages[name] = dirname(packageJSON);
    }
  }

  return packages;
}
