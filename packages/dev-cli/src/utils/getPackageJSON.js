import { readFile } from 'node:fs/promises';

/**
 * Gets the contents of the provided package.json.
 * @param {string} pathToPackageJSON
 * @returns {Promise<{ scripts?: Record<string, string>, dependencies?: Record<string, string>, devDependencies?: Record<string, string>}>}
 */
export async function getPackageJSON(pathToPackageJSON) {
  const packageJSON = await readFile(pathToPackageJSON, 'utf-8');
  return JSON.parse(packageJSON);
}
