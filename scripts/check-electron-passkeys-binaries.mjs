#!/usr/bin/env node

import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_NPM_DIR = 'packages/electron-passkeys/npm';

export async function findMissingBinaries(npmDir) {
  const entries = await readdir(npmDir, { withFileTypes: true });
  const missing = [];

  for (const entry of entries.filter(entry => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    const dir = resolve(npmDir, entry.name);
    const files = await readdir(dir, { withFileTypes: true });
    const count = files.filter(file => file.isFile() && file.name.endsWith('.node')).length;

    if (count !== 1) {
      missing.push({ dir, count });
    }
  }

  return missing;
}

export function formatBinaryCountError(dir, count) {
  const packageType = count === 0 ? 'empty' : 'invalid';

  return `::error::${dir} has ${count} .node binaries (expected exactly 1); publishing it would ship an ${packageType} package`;
}

async function main() {
  const npmDir = process.argv[2] || DEFAULT_NPM_DIR;
  let missing;

  try {
    missing = await findMissingBinaries(npmDir);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`::error::Failed to scan ${npmDir}: ${message}`);
    process.exit(1);
  }

  if (missing.length > 0) {
    for (const { dir, count } of missing) {
      console.error(formatBinaryCountError(dir, count));
    }

    process.exit(1);
  }

  console.log('All electron-passkeys platform packages contain exactly one .node binary.');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  await main();
}
