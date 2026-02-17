#!/usr/bin/env zx

import { cp, mkdir, mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import * as core from '@actions/core';
import { $, argv, cd, chalk } from 'zx';

try {
  // Setup variables and environment variables
  const SITE_PATH = argv._[0];
  const ROOT_PATH = new URL('../', import.meta.url).pathname;
  const FULL_SITE_PATH = join(ROOT_PATH, SITE_PATH);
  const TMP_FOLDER = await mkdtemp(join(tmpdir(), 'clerk-site-'));
  const FULL_TMP_FOLDER = join(TMP_FOLDER, SITE_PATH);
  process.env.FORCE_COLOR = '1';

  core.debug(`Path variables:

SITE_PATH: ${SITE_PATH}
ROOT_PATH: ${ROOT_PATH}
FULL_SITE_PATH: ${FULL_SITE_PATH}
TMP_FOLDER: ${TMP_FOLDER}
FULL_TMP_FOLDER: ${FULL_TMP_FOLDER}`);

  // Create temporary folder setup
  await mkdir(FULL_TMP_FOLDER, { recursive: true });

  // Copy the site into the temporary location to isolate it
  core.info(`Copying ${chalk.bold(SITE_PATH)} into ${chalk.bold(FULL_TMP_FOLDER)}`);
  await cp(FULL_SITE_PATH, FULL_TMP_FOLDER, { recursive: true });

  // Find @clerk/* dependencies in the site's package.json
  const sitePkg = JSON.parse(await readFile(join(FULL_TMP_FOLDER, 'package.json'), 'utf-8'));
  const clerkDeps = [...Object.keys(sitePkg.dependencies || {}), ...Object.keys(sitePkg.devDependencies || {})].filter(
    name => name.startsWith('@clerk/'),
  );

  await core.group('Publishing packages to local registry', async () => {
    cd(ROOT_PATH);
    await $`pkglab pub --force`;
  });

  if (clerkDeps.length > 0) {
    await core.group('Installing @clerk/* dependencies via pkglab', async () => {
      cd(FULL_TMP_FOLDER);
      await $`pkglab add ${clerkDeps}`;
    });
  }

  core.exportVariable('FULL_TMP_FOLDER', FULL_TMP_FOLDER);
} catch (e) {
  // Bail on errors
  core.setFailed(`Script failed with error: ${e}`);
  process.exit();
}
