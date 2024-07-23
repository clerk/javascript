import { readFile } from 'node:fs/promises';

/**
 * Gets the `dependencies` and `devDependencies` entries of the provided package.json.
 * @param {string} pathToPackageJSON
 * @returns {Promise<{ dependencies?: Record<string, string>, devDependencies?: Record<string, string>}>}
 */
export async function getDependencies(pathToPackageJSON) {
  const packageJSON = await readFile(pathToPackageJSON, 'utf-8');
  const { dependencies, devDependencies } = JSON.parse(packageJSON);
  return { dependencies, devDependencies };
}
