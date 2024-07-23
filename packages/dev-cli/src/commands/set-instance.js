import { writeFile } from 'node:fs/promises';

import { CONFIG_FILE, getConfiguration } from '../utils/getConfiguration.js';

/**
 * Sets the active instance to the provided instance name.
 * @param {object} args
 * @param {string} args.instance
 */
export async function setInstance({ instance }) {
  const config = await getConfiguration();

  if (!(instance in config.instances)) {
    throw new Error(`Instance "${instance}" not found in dev.json.`);
  }

  const newConfig = { ...config, activeInstance: instance };
  await writeFile(CONFIG_FILE, JSON.stringify(newConfig, null, 2), 'utf-8');
  console.log(`clerk-dev activeInstance set to ${instance}.`);
}
