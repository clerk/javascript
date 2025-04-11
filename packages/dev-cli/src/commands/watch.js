import { join } from 'node:path';

import concurrently from 'concurrently';

import { NULL_ROOT_ERROR } from '../utils/errors.js';
import { getClerkPackages } from '../utils/getClerkPackages.js';
import { getDependencies } from '../utils/getDependencies.js';
import { getMonorepoRoot } from '../utils/getMonorepoRoot.js';

/**
 * Starts long-running watchers for Clerk dependencies.
 * @param {object} args
 * @param {boolean | undefined} args.js If `true`, only spawn the builder for `@clerk/clerk-js`.
 * @returns {Promise<import('concurrently').CloseEvent[]>}
 */
export async function watch({ js }) {
  const { dependencies, devDependencies } = await getDependencies(join(process.cwd(), 'package.json'));
  const clerkPackages = Object.keys(await getClerkPackages());

  const packagesInPackageJSON = [...Object.keys(dependencies ?? {}), ...Object.keys(devDependencies ?? {})];
  const clerkPackagesInPackageJSON = packagesInPackageJSON.filter(p => clerkPackages.includes(p));

  const filterArgs = clerkPackagesInPackageJSON.map(p => `--filter=${p}`);

  const args = ['watch', 'build', ...filterArgs];

  const cwd = await getMonorepoRoot();
  if (!cwd) {
    throw new Error(NULL_ROOT_ERROR);
  }

  // Sometimes, the turbo daemon can get stuck in a weird state, so we clean it up before starting the watchers.
  await concurrently([{ name: 'turbo-daemon-clean', command: 'turbo daemon clean', cwd, env: { ...process.env } }])
    .result;

  /** @type {import('concurrently').ConcurrentlyCommandInput} */
  const clerkJsCommand = {
    name: 'clerk-js',
    command: 'turbo run dev --filter=@clerk/clerk-js -- --env devOrigin=http://localhost:4000',
    cwd,
    // Turborepo is supposed to use the daemon by default in `watch` mode, but only when attached to a PTY. Since we're
    // redirecting stdout, we have to force it to use the daemon.
    env: { TURBO_UI: '0', TURBO_DAEMON: 'true', ...process.env },
  };

  /** @type {import('concurrently').ConcurrentlyCommandInput} */
  const packagesCommand = {
    name: 'packages',
    command: `turbo ${args.join(' ')}`,
    cwd,
    env: { TURBO_UI: '0', ...process.env },
  };

  if (js) {
    const { result } = concurrently([clerkJsCommand], { prefixColors: 'auto' });
    return result;
  }

  /** @type {import('concurrently').ConcurrentlyCommandInput[]} */
  const commands = [packagesCommand];
  if (typeof js === 'undefined') {
    commands.push(clerkJsCommand);
  }

  const { result } = concurrently(commands, { prefixColors: 'auto' });
  return result;
}
