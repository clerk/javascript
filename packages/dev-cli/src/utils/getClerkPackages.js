import { readFile } from 'node:fs/promises';
import { dirname, join, posix, resolve } from 'node:path';

import { globby } from 'globby';

/**
 * Generates an object with keys of package names and values of absolute paths to the package folder.
 * @returns {Promise<Record<string, string>>}
 */
export async function getClerkPackages() {
  const monorepoRoot = resolve(join(import.meta.dirname, '..', '..', '..', '..'));
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
