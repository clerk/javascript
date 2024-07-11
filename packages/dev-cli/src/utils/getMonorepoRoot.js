import { join, resolve } from 'node:path';

import { getConfiguration } from './getConfiguration.js';

export function getCLIRoot() {
  return resolve(join(import.meta.dirname, '..', '..', '..', '..'));
}

/**
 * Gets the `root` property of the clerk-dev configuration file, falling back to the folder containing the source
 * for the running instance of clerk-dev.
 * @returns {Promise<string>}
 */
export async function getMonorepoRoot() {
  const config = await getConfiguration();
  if (config.root) {
    return config.root;
  }

  return getCLIRoot();
}
