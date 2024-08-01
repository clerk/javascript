#!/usr/bin/env zx

import { $, argv, echo } from 'zx';

import { constants } from './common.mjs';

const snapshot = `---
'@clerk/chrome-extension': patch
'@clerk/localizations': patch
'@clerk/clerk-js': patch
'@clerk/clerk-sdk-node': patch
'@clerk/backend': patch
'@clerk/fastify': patch
'@clerk/nextjs': patch
'@clerk/shared': patch
'@clerk/themes': patch
'@clerk/clerk-react': patch
'@clerk/remix': patch
'@clerk/types': patch
'@clerk/clerk-expo': patch
'@clerk/express': patch
'@clerk/testing': patch
'@clerk/elements': patch
---

Snapshot release
`;

const prefix = argv.name || argv._[0] || 'snapshot';

await $`npx json -I -f ${constants.ChangesetConfigFile} -e "this.changelog = false"`;

try {
  // exit pre-release mode if we're in it
  await $`npx changeset pre exit`;
  // bump the version of all affected packages
  // this will remove the prerelease versions
  // but will also clear the changeset .md files
  await $`npx changeset version`;
  // generate a temp .md file that indicates that all packages have changes
  // in order to force a snapshot release
  await $`touch .changeset/snap.md && echo ${snapshot} > .changeset/snap.md`;
} catch (e) {
  // otherwise, do nothing
}

const res = await $`npx changeset version --snapshot ${prefix}`;
const success = !res.stderr.includes('No unreleased changesets found');

await $`git checkout HEAD -- ${constants.ChangesetConfigFile}`;

if (success) {
  echo('success=1');
} else {
  echo('success=0');
}
