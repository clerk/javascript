import { spawn } from 'node:child_process';
import { join } from 'node:path';

import { getClerkPackages } from '../utils/getClerkPackages.js';
import { getDependencies } from '../utils/getDependencies.js';

/**
 * @returns {Promise<void>}
 */
async function linkDependencies() {
  const { dependencies } = await getDependencies(join(process.cwd(), 'package.json'));
  if (!dependencies) {
    throw new Error('you have no dependencies');
  }
  const clerkPackages = await getClerkPackages();

  const dependenciesToBeInstalled = Object.keys(dependencies)
    .filter(dep => dep in clerkPackages)
    .map(clerkDep => clerkPackages[clerkDep]);

  const args = ['install', '--no-audit', '--no-fund', ...dependenciesToBeInstalled];

  return new Promise((resolve, reject) => {
    const child = spawn('npm', args, {
      stdio: 'inherit',
      env: {
        ...process.env,
        ADBLOCK: '1',
        DISABLE_OPENCOLLECTIVE: '1',
      },
    });

    child.on('close', code => {
      if (code !== 0) {
        reject();
        return;
      }
      resolve();
    });
  });
}

/**
 * Installs the monorepo-versions of Clerk dependencies listed in the `package.json` file of the current
 * working directory.
 */
async function install() {
  await linkDependencies();
}

export { install };
