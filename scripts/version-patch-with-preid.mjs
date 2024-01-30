#!/usr/bin/env zx

import * as core from '@actions/core';
import { $, argv } from 'zx';

import { constants } from './common.mjs';

const PACKAGES = argv.packages?.split(',') || [];
const PREID = argv.preid;

if (PACKAGES.length === 0) {
  core.setFailed(
    'No packages were specified. Specify a list of comma-separate packages to version (e.g. "@clerk/remix,@clerk/nextjs")',
  );
  process.exit();
}

if (!PREID) {
  core.setFailed('No preid was specified. Specify a preid to use for the version (e.g. "alpha")');
  process.exit();
}

const changes = `---
${PACKAGES.map(pkg => `'${pkg}': patch`).join('\n')}
---

Patch release
`;

await $`npx json -I -f ${constants.ChangesetConfigFile} -e "this.changelog = false"`;

try {
  // exit pre-release mode if we're in it
  await $`npx changeset pre exit`;
  // bump the version of all affected packages
  // this will remove the prerelease versions
  // but will also clear the changeset .md files
  await $`npx changeset version`;
  // generate a temp .md file that indicates that all packages have changes
  // in order to force a patch release
  await $`touch .changeset/patch.md && echo ${changes} > .changeset/patch.md`;
} catch (e) {
  // otherwise, do nothing
}

const res = await $`npx changeset version`;
const success = !res.stderr.includes('No unreleased changesets found');

await $`git checkout HEAD -- ${constants.ChangesetConfigFile}`;

if (success) {
  core.info('Versioning was successful!');
} else {
  core.setFailed(`Script failed with error: ${res.stderr}`);
  process.exit();
}
