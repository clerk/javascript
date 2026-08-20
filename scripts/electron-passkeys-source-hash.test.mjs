import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, test } from 'vitest';

import { computeSourceHash, formatStaleError } from './electron-passkeys-source-hash.mjs';

const roots = [];

async function createPackage(files) {
  const root = await mkdtemp(join(tmpdir(), 'electron-passkeys-source-'));
  roots.push(root);

  const defaults = {
    'src/lib.rs': 'fn main() {}',
    'Cargo.toml': '[package]',
    'Cargo.lock': '',
    'build.rs': '',
  };
  for (const [path, content] of Object.entries({ ...defaults, ...files })) {
    await mkdir(join(root, path, '..'), { recursive: true });
    await writeFile(join(root, path), content);
  }

  return root;
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map(root => rm(root, { force: true, recursive: true })));
});

describe('computeSourceHash', () => {
  test('is stable across identical trees in different locations', async () => {
    const a = await createPackage({});
    const b = await createPackage({});

    await expect(computeSourceHash(a)).resolves.toBe(await computeSourceHash(b));
  });

  test('changes when a Rust source file changes', async () => {
    const a = await createPackage({});
    const b = await createPackage({ 'src/lib.rs': 'fn main() { changed(); }' });

    expect(await computeSourceHash(a)).not.toBe(await computeSourceHash(b));
  });

  test('changes when Cargo.lock changes', async () => {
    const a = await createPackage({});
    const b = await createPackage({ 'Cargo.lock': 'version = 4' });

    expect(await computeSourceHash(a)).not.toBe(await computeSourceHash(b));
  });

  test('ignores files outside the native inputs', async () => {
    const a = await createPackage({});
    const b = await createPackage({ 'index.js': 'module.exports = {}', 'npm/darwin-x64/package.json': '{}' });

    await expect(computeSourceHash(a)).resolves.toBe(await computeSourceHash(b));
  });
});

describe('formatStaleError', () => {
  test('names both hashes and the remediation', () => {
    expect(formatStaleError('bbb', 'aaa')).toBe(
      '::error::electron-passkeys binaries were built from source hash aaa but the tree is at bbb; re-run the "Electron Passkeys Native Build" workflow on this commit',
    );
  });
});
