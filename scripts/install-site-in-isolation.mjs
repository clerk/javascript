#!/usr/bin/env zx

import { cp, mkdir, mkdtemp } from 'node:fs/promises';
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
  process.env.SECCO_SOURCE_PATH = ROOT_PATH;
  process.env.FORCE_COLOR = '1';

  core.debug(`Path variables:

SITE_PATH: ${SITE_PATH}
ROOT_PATH: ${ROOT_PATH}
FULL_SITE_PATH: ${FULL_SITE_PATH}
TMP_FOLDER: ${TMP_FOLDER}
FULL_TMP_FOLDER: ${FULL_TMP_FOLDER}`);

  // Installing secco
  await core.group('Installing secco (if not already installed)', async () => {
    await $`command -v secco || (command -v sudo && sudo npm install -g secco@latest) || npm install -g secco@latest`;
  });

  // Create temporary folder setup
  await mkdir(FULL_TMP_FOLDER, { recursive: true });

  // Copy the site into the temporary location to isolate it
  core.info(`Copying ${chalk.bold(SITE_PATH)} into ${chalk.bold(FULL_TMP_FOLDER)}`);
  await cp(FULL_SITE_PATH, FULL_TMP_FOLDER, { recursive: true });

  await core.group('Installing dependencies through secco', async () => {
    cd(FULL_TMP_FOLDER);
    await $`secco --force-verdaccio --scan-once`;
  });

  core.exportVariable('FULL_TMP_FOLDER', FULL_TMP_FOLDER);
} catch (e) {
  // Bail on errors
  core.setFailed(`Script failed with error: ${e}`);
  process.exit();
}
