#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_PACKAGE_DIR = 'packages/electron-passkeys';
export const DEFAULT_HASH_FILE = 'packages/electron-passkeys/npm/.source-hash';

// Inputs that change the compiled binary. Anything else in the package (loader, README, npm/*) does not.
export const SOURCE_INPUTS = ['src', 'Cargo.toml', 'Cargo.lock', 'build.rs'];

async function collectFiles(path) {
  const info = await stat(path);
  if (!info.isDirectory()) {
    return [path];
  }
  const entries = await readdir(path, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => collectFiles(join(path, entry.name))));
  return nested.flat();
}

export async function computeSourceHash(packageDir) {
  const files = (await Promise.all(SOURCE_INPUTS.map(input => collectFiles(resolve(packageDir, input))))).flat();
  const hash = createHash('sha256');

  for (const file of files.sort()) {
    hash.update(relative(packageDir, file).split('\\').join('/'));
    hash.update('\0');
    hash.update(await readFile(file));
    hash.update('\0');
  }

  return hash.digest('hex');
}

export function formatStaleError(expected, actual) {
  return `::error::electron-passkeys binaries were built from source hash ${actual} but the tree is at ${expected}; re-run the "Electron Passkeys Native Build" workflow on this commit`;
}

export function formatStaleWarning(expected, actual) {
  return `::warning::electron-passkeys binaries were built from source hash ${actual} but the tree is at ${expected}; the published binaries do not include this branch's native changes`;
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const warnOnly = rest.includes('--warn');
  const positional = rest.filter(arg => !arg.startsWith('--'));
  const hashFile = positional[0] || DEFAULT_HASH_FILE;
  const packageDir = positional[1] || DEFAULT_PACKAGE_DIR;
  const expected = await computeSourceHash(packageDir);

  if (command === 'write') {
    await writeFile(hashFile, `${expected}\n`);
    console.log(`Wrote source hash ${expected} to ${hashFile}`);
    return;
  }

  if (command === 'verify') {
    let actual;
    try {
      actual = (await readFile(hashFile, 'utf8')).trim();
    } catch {
      console.error(
        `::error::${hashFile} is missing; the downloaded electron-passkeys artifact predates source hashing`,
      );
      process.exit(1);
    }

    if (actual === expected) {
      console.log(`electron-passkeys binaries match source hash ${expected}.`);
      return;
    }

    if (warnOnly) {
      console.warn(formatStaleWarning(expected, actual));
      return;
    }

    console.error(formatStaleError(expected, actual));
    process.exit(1);
  }

  console.error(`Usage: electron-passkeys-source-hash.mjs <write|verify> [hashFile] [packageDir] [--warn]`);
  process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  await main();
}
