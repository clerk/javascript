import { join, resolve } from 'node:path';

import { getConfiguration } from './getConfiguration.js';

export function getCLIRoot() {
  return resolve(join(import.meta.dirname, '..', '..', '..', '..'));
}

/**
 * Gets the `root` property of the clerk-dev configuration file.
 * @returns {Promise<string | null>}
 */
export async function getMonorepoRoot() {
  const config = await getConfiguration();
  return config.root;
}
