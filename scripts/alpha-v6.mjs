#!/usr/bin/env zx

import { $, echo } from 'zx';

import { constants } from './common.mjs';

const snapshot = `---
'@clerk/backend': patch
'@clerk/shared': patch
'@clerk/react': patch
'@clerk/clerk-js': patch
'@clerk/nextjs': patch
---

Alpha-v6 release
`;

await $`pnpm dlx json -I -f ${constants.ChangesetConfigFile} -e "this.changelog = false"`;

try {
  // exit pre-release mode if we're in it
  await $`pnpm changeset pre exit`;
  // bump the version of all affected packages
  // this will remove the prerelease versions
  // but will also clear the changeset .md files
  await $`pnpm changeset version`;
  // generate a temp .md file that indicates that all packages have changes
  // in order to force a snapshot release
  await $`touch .changeset/snap.md && echo ${snapshot} > .changeset/snap.md`;
} catch {
  // otherwise, do nothing
}

const res = await $`pnpm changeset version --snapshot alpha-v6`;
const success = !res.stderr.includes('No unreleased changesets found');

await $`git checkout HEAD -- ${constants.ChangesetConfigFile}`;

if (success) {
  echo('success=1');
} else {
  echo('success=0');
}
