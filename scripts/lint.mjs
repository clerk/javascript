#!/usr/bin/env node

import { $, chalk } from 'zx';

$.env = {
  ...process.env,
  FORCE_COLOR: 1,
};
$.stdio = 'inherit';
$.verbose = !!process.env.VERBOSE;

const [github, integration, scripts] = await Promise.allSettled([
  $`echo "SKIPPING: pnpm eslint .github/workflows"`,
  $`pnpm eslint integration`,
  $`pnpm eslint scripts`,
]);

let packages;
try {
  await $`pnpm turbo lint -- --quiet`;
} catch (error) {
  packages = error;
}

function logLintResult(status, directory, command) {
  console.log('');

  if (status === 'rejected') {
    console.log(chalk.red(`${directory} lint failed`));
    console.log(`Run '${chalk.bold(command)}' to reproduce the error`);
  }
  if (status === 'fulfilled') {
    console.log(chalk.green(`${directory} lint passed`));
  }
}

logLintResult(github.status, 'GitHub Actions', 'pnpm eslint .github/workflows');
logLintResult(integration.status, 'Integration directory', 'pnpm eslint integration');
logLintResult(scripts.status, 'Scripts directory', 'pnpm eslint scripts');

if (packages?.exitCode) {
  console.log('');
  console.log(chalk.red('Packages lint failed'));
  console.log(`Run '${chalk.bold('pnpm turbo lint')}' to reproduce the error`);
}

if (integration.status === 'rejected' || packages?.exitCode) {
  process.exit(1);
}
