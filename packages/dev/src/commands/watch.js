import { spawn } from 'node:child_process';
import { join } from 'node:path';

import { getClerkPackages } from '../utils/getClerkPackages.js';
import { getDependencies } from '../utils/getDependencies.js';
import { getMonorepoRoot } from '../utils/getMonorepoRoot.js';

/**
 * Starts long-running watchers for Clerk dependencies.
 * @param {object} args
 * @param {boolean | undefined} args.js If `true`, only spawn the builder for `@clerk/clerk-js`.
 * @returns {Promise<void>}
 */
export async function watch({ js }) {
  const { dependencies, devDependencies } = await getDependencies(join(process.cwd(), 'package.json'));
  const clerkPackages = Object.keys(await getClerkPackages());

  const packagesInPackageJSON = [...Object.keys(dependencies ?? {}), ...Object.keys(devDependencies ?? {})];
  const clerkPackagesInPackageJSON = packagesInPackageJSON.filter(p => clerkPackages.includes(p));

  const filterArgs = clerkPackagesInPackageJSON.map(p => `--filter=${p}`);

  const args = ['watch', 'build', ...filterArgs];

  const cwd = await getMonorepoRoot();

  if (js) {
    return new Promise((resolve, reject) => {
      const child = spawn(
        'turbo',
        ['run', 'dev', '--filter=@clerk/clerk-js', '--', '--env', 'devOrigin=http://localhost:4000'],
        {
          cwd,
          stdio: 'inherit',
          env: { ...process.env },
        },
      );

      child.on('close', code => {
        if (code !== 0) {
          reject();
          return;
        }
        resolve();
      });
    });
  }

  if (typeof js === 'undefined') {
    if (process.platform === 'darwin') {
      spawn('osascript', [
        '-e',
        `tell app "Terminal" to do script "cd ${cwd} && turbo run dev --filter=@clerk/clerk-js -- --env devOrigin=http://localhost:4000"`,
      ]);
    }
  }

  return new Promise((resolve, reject) => {
    const child = spawn('turbo', args, {
      cwd,
      stdio: 'inherit',
      env: {
        ...process.env,
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
