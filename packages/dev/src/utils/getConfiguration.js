import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

/**
 * @typedef {object} InstanceConfiguration
 * @prop {string} secretKey
 * @prop {string} publishableKey
 * @prop {string} fapiUrl
 * @prop {string} bapiUrl
 */

/**
 * @typedef {object} Configuration
 * @prop {string} $schema
 * @prop {string | null} root
 * @prop {string} activeInstance
 * @prop {Record<string, InstanceConfiguration>} instances
 */

export const CONFIG_FILE = join(homedir(), '.config', 'clerk', 'dev.json');

/**
 * Gets the contents of the clerk-dev configuration file.
 * @returns {Promise<Configuration>}
 */
export async function getConfiguration() {
  const configFileJSON = await readFile(CONFIG_FILE, 'utf-8');
  const configuration = JSON.parse(configFileJSON);
  return configuration;
}
