#!/usr/bin/env node

import { access, constants, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { $ } from 'zx';

const $$ = $({
  env: { NODE_ENV: 'production' },
  verbose: !!process.env.VERBOSE,
});

const DIRECTORIES_TO_CLEAN = ['.coverage', '.turbo', 'coverage', 'dist', 'node_modules'];

// Iterate over `packages/*`
try {
  const packagesDir = resolve('packages');
  await access(packagesDir, constants.R_OK);

  try {
    const packages = await readdir(packagesDir);
    const promises = packages.map(
      dir => $$`rm -rf ${DIRECTORIES_TO_CLEAN.map(directory => join(join(packagesDir, dir), directory))}`,
    );

    await Promise.all(promises).then(() => void console.log(`Cleaned ${promises.length} packages`));
  } catch (error) {
    console.error(error);
  }
} catch {
  console.log('Cannot access packages directory');
}

// Iterate over `playground/*`
try {
  const playgroundDir = resolve('playground');
  await access(playgroundDir);
  try {
    const playgrounds = await readdir(playgroundDir);

    await Promise.allSettled(
      playgrounds.map(
        dir => $$`rm -rf ${DIRECTORIES_TO_CLEAN.map(directory => join(join(playgroundDir, dir), directory))}`,
      ),
    ).then(() => void console.log(`Cleaned playground directories`));
  } catch (error) {
    console.error(error);
  }
} catch {
  console.log('Cannot access playground directory');
}

await $$`rm -rf .turbo`.then(() => console.log('Removed root .turbo directory'));
await $$`rm -rf node_modules`.then(() => console.log('Removed root node_modules'));
