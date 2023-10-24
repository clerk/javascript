#!/usr/bin/env zx

import 'zx/globals';

import { constants } from './common.mjs';

await $`npx json -I -f ${constants.ChangesetConfigFile} -e "this.changelog = false"`;

const res = await $`npx changeset version --snapshot canary`;
const success = !res.stderr.includes('No unreleased changesets found');

await $`git checkout HEAD -- ${constants.ChangesetConfigFile}`;

if (success) {
  echo('success=1');
} else {
  echo('success=0');
}
