#!/usr/bin/env zx

import { $, echo } from 'zx';

import { constants, getChangesetIgnoredPackages, getPackageNames, pinWorkspaceDeps } from './common.mjs';

const ignoredPackages = await getChangesetIgnoredPackages();
const packageNames = (await getPackageNames()).filter(name => !ignoredPackages.has(name));
const packageEntries = packageNames.map(name => `'${name}': patch`).join('\n');

const snapshot = `---
${packageEntries}
---

Canary release
`;

await $`pnpm dlx json -I -f ${constants.ChangesetConfigFile} -e "this.changelog = false"`;

try {
  // exit pre-release mode if we're in it
  await $`pnpm changeset pre exit`;
  // bump the version of all affected packages
  // this will remove the prerelease versions
  // but will also clear the changeset .md files
  await $`pnpm changeset version`;
} catch {
  // not in pre-release mode, continue
}

// Always generate a temp .md file that indicates that all packages have changes
// in order to force a canary release of all packages
await $`touch .changeset/snap.md && echo ${snapshot} > .changeset/snap.md`;

// Convert workspace:^ to workspace:* for @clerk/* deps to ensure exact versions
// This prevents semver range issues like ^3.0.0-canary matching older snapshots
await pinWorkspaceDeps();

const res = await $`pnpm changeset version --snapshot canary`;
const success = !res.stderr.includes('No unreleased changesets found');

await $`git checkout HEAD -- ${constants.ChangesetConfigFile}`;

if (success) {
  echo('success=1');
} else {
  echo('success=0');
}
