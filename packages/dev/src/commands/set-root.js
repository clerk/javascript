import { readFile, writeFile } from 'node:fs/promises';

import { CONFIG_FILE, getConfiguration } from '../utils/getConfiguration.js';

/**
 * Sets the location of the clerk/javascript monorepo to the machine-level config file.
 */
export async function setRoot() {
  const config = await getConfiguration();
  const cwd = process.cwd();

  const packageJSON = await readFile('package.json', 'utf-8');
  const pkg = JSON.parse(packageJSON);
  if (pkg.name !== '@clerk/javascript') {
    throw new Error('clerk-dev set-root needs to be run within a local checkout of the clerk/javascript repository.');
  }

  const newConfig = { ...config, root: process.cwd() };
  await writeFile(CONFIG_FILE, JSON.stringify(newConfig, null, 2), 'utf-8');
  console.log(`clerk-dev root set to ${cwd}.`);
}
