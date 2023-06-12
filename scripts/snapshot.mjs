#!/usr/bin/env zx

import 'zx/globals';
import { constants } from './common.mjs';

const prefix = argv.name || argv._[0] || 'snapshot';

await $`npx json -I -f ${constants.ChangesetConfigFile} -e "this.changelog = false"`;

const res = await $`npx changeset version --snapshot ${prefix}`;
const success = !res.stderr.includes('No unreleased changesets found');

await $`git checkout HEAD -- ${constants.ChangesetConfigFile}`;

if (success) {
  echo('success=1');
} else {
  echo('success=0');
}
