import { join } from 'node:path';

import concurrently from 'concurrently';

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

  /** @type {import('concurrently').ConcurrentlyCommandInput} */
  const clerkJsCommand = {
    name: 'clerk-js',
    command: 'turbo run dev --filter=@clerk/clerk-js -- --env devOrigin=http://localhost:4000',
    cwd,
    env: { TURBO_UI: '0', ...process.env },
  };

  /** @type {import('concurrently').ConcurrentlyCommandInput} */
  const packagesCommand = {
    name: 'packages',
    command: `turbo ${args.join(' ')}`,
    cwd,
    env: { TURBO_UI: '0', ...process.env },
  };

  if (js) {
    //@ts-expect-error The TypeScript types for the ESM version of concurrently are wrong. https://github.com/open-cli-tools/concurrently/issues/494
    const { result } = concurrently([clerkJsCommand], { prefixColors: 'auto' });
    return result;
  }

  /** @type {import('concurrently').ConcurrentlyCommandInput[]} */
  const commands = [packagesCommand];
  if (typeof js === 'undefined') {
    commands.push(clerkJsCommand);
  }

  //@ts-expect-error The TypeScript types for the ESM version of concurrently are wrong. https://github.com/open-cli-tools/concurrently/issues/494
  const { result } = concurrently(commands, { prefixColors: 'auto' });
  return result;
}
