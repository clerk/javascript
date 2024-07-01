import { readFile } from 'node:fs/promises';

/**
 *
 * @param {string} pathToPackageJSON
 * @returns {Promise<{ dependencies?: Record<string, string>, devDependencies?: Record<string, string>}>}
 */
export async function getDependencies(pathToPackageJSON) {
  const packageJSON = await readFile(pathToPackageJSON, 'utf-8');
  const { dependencies, devDependencies } = JSON.parse(packageJSON);
  return { dependencies, devDependencies };
}
