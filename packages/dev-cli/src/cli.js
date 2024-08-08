import { Command } from 'commander';

import { config } from './commands/config.js';
import { init } from './commands/init.js';
import { setInstance } from './commands/set-instance.js';
import { setRoot } from './commands/set-root.js';
import { setup } from './commands/setup.js';
import { watch } from './commands/watch.js';
import { getPackageVersion } from './utils/getPackageVersion.js';

export default function cli() {
  const program = new Command();

  program.name('clerk-dev').description('CLI to make developing Clerk packages easier').version(getPackageVersion());

  program
    .command('init')
    .description('Perform initial one-time machine setup')
    .action(async () => {
      await init();
    });

  program
    .command('config')
    .description('Open the clerk-dev config file in EDITOR or VISUAL')
    .action(async () => {
      await config();
    });

  program
    .command('set-root')
    .description(
      'Set the location of your checkout of the clerk/javascript repository to the current working directory',
    )
    .action(async () => {
      await setRoot();
    });

  program
    .command('set-instance')
    .description('Set the active instance to the provided instance name')
    .argument('<name>', 'name of instance listed in dev.json')
    .action(async instance => {
      await setInstance({ instance });
    });

  program
    .command('setup')
    .description(
      'Install the monorepo versions of Clerk packages listed in the package.json file and perform framework configuration for the current working directory',
    )
    .option('--no-js', 'do not customize the clerkJSUrl')
    .option('--skip-install', 'only perform framework configuration; do not install monorepo versions of packages')
    .action(async ({ js, skipInstall }) => {
      await setup({ js, skipInstall });
    });

  program
    .command('watch')
    .description(
      'Start the dev tasks for all Clerk packages listed in the package.json file in the current working directory, including clerk-js (unless --no-js is specified)',
    )
    .option('--js', 'only start the watcher for clerk-js')
    .option('--no-js', 'do not spawn the clerk-js watcher (macOS only)')
    .action(async ({ js }) => {
      await watch({ js });
    });

  program.parseAsync();
}
