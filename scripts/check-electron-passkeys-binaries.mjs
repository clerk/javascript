#!/usr/bin/env node

import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_NPM_DIR = 'packages/electron-passkeys/npm';

export async function findMissingBinaries(npmDir) {
  const entries = await readdir(npmDir, { withFileTypes: true });
  const platformDirs = entries.filter(entry => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name));
  const missing = [];

  for (const platformDir of platformDirs) {
    const dir = resolve(npmDir, platformDir.name);
    const files = await readdir(dir, { withFileTypes: true });
    const count = files.filter(file => file.isFile() && file.name.endsWith('.node')).length;

    if (count !== 1) {
      missing.push({ dir, count });
    }
  }

  return missing;
}

async function main() {
  const npmDir = process.argv[2] || DEFAULT_NPM_DIR;
  const missing = await findMissingBinaries(npmDir);

  if (missing.length > 0) {
    for (const { dir, count } of missing) {
      console.error(
        `::error::${dir} has ${count} .node binaries (expected exactly 1); publishing it would ship an empty package`,
      );
    }

    process.exit(1);
  }

  console.log('All electron-passkeys platform packages contain exactly one .node binary.');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  await main();
}
