import { readFile } from 'node:fs/promises';
import { dirname, posix } from 'node:path';

import { glob } from 'tinyglobby';

import { NULL_ROOT_ERROR } from './errors.js';
import { getMonorepoRoot } from './getMonorepoRoot.js';

/**
 * Generates an object with keys of package names and values of absolute paths to the package folder.
 * @returns {Promise<Record<string, string>>}
 */
export async function getClerkPackages() {
  const monorepoRoot = await getMonorepoRoot();
  if (!monorepoRoot) {
    throw new Error(NULL_ROOT_ERROR);
  }
  /** @type {Record<string, string>} */
  const packages = {};
  const clerkPackages = await glob([posix.join(monorepoRoot, 'packages', '*', 'package.json'), '!*node_modules*']);
  for (const packageJSON of clerkPackages) {
    const { name } = JSON.parse(await readFile(packageJSON, 'utf-8'));
    if (name) {
      packages[name] = dirname(packageJSON);
    }
  }

  return packages;
}
