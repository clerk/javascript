#!/usr/bin/env zx

import { $, echo } from 'zx';

import { constants } from './common.mjs';

await $`npx json -I -f ${constants.ChangesetConfigFile} -e "this.changelog = false"`;

try {
  // exit pre-release mode if we're in it
  await $`npx changeset pre exit`;
  // bump the version of all affected packages
  // this will remove the prerelease versions
  // but will also clear the changeset .md files
  await $`npx changeset version`;
} catch (e) {
  // otherwise, do nothing
}

const res = await $`npx changeset version --snapshot canary`;
const success = !res.stderr.includes('No unreleased changesets found');

await $`git checkout HEAD -- ${constants.ChangesetConfigFile}`;

if (success) {
  echo('success=1');
} else {
  echo('success=0');
}
