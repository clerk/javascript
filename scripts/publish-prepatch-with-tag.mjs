#!/usr/bin/env zx

import * as core from '@actions/core';
import { $, argv } from 'zx';

const PACKAGE = argv.package;
const PREID = argv.preid;

if (!PACKAGE) {
  core.setFailed('No package was specified. Specify a valid package name');
  process.exit();
}

if (!PREID) {
  core.setFailed('No preid was specified. Specify a preid to use for the version (e.g. "alpha")');
  process.exit();
}

try {
  // Use PACKAGE to define the npm workspace and then run npm version
  await $`npm version prepatch --no-git-tag-version --preid=${PREID} --workspace=${PACKAGE}`;

  // Publish package to npm
  await $`npm publish --workspace=${PACKAGE} --tag=${PREID} --dry-run`;
} catch (e) {
  core.setFailed(`Script failed with error: ${e}`);
  process.exit();
}
