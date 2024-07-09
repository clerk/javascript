import { Command } from 'commander';

import { init } from './commands/init.js';
import { install } from './commands/install.js';
import { setRoot } from './commands/set-root.js';
import { setup } from './commands/setup.js';
import { watch } from './commands/watch.js';

export default function cli() {
  const program = new Command();

  program.name('clerk-dev').description('CLI to make developing Clerk packages easier').version('0.0.0');

  program
    .command('init')
    .description('Perform initial one-time machine setup')
    .action(async () => {
      await init();
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
    .command('install')
    .description(
      'Install the monorepo versions of Clerk packages listed in the package.json file of the current working directory',
    )
    .action(async () => {
      await install();
    });

  program
    .command('setup')
    .description('Perform framework configuration for the current working directory')
    .option('--no-js', 'do not customize the clerkJSUrl')
    .action(async ({ js }) => {
      await setup({ js });
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
