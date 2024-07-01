import { join, resolve } from 'node:path';

import { getConfiguration } from './getConfiguration.js';

export function getCLIRoot() {
  return resolve(join(import.meta.dirname, '..', '..', '..', '..'));
}

/**
 *
 * @returns {Promise<string>}
 */
export async function getMonorepoRoot() {
  const config = await getConfiguration();
  if (config.root) {
    return config.root;
  }

  return getCLIRoot();
}
