import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, test } from 'vitest';

import { findMissingBinaries, formatBinaryCountError } from './check-electron-passkeys-binaries.mjs';

const roots = [];

async function createRoot() {
  const root = await mkdtemp(join(tmpdir(), 'electron-passkeys-binaries-'));
  roots.push(root);
  return root;
}

async function createPlatformDir(root, name, nodeFiles) {
  const dir = join(root, name);
  await mkdir(dir, { recursive: true });

  await Promise.all(nodeFiles.map(file => writeFile(join(dir, file), '')));

  return dir;
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map(root => rm(root, { force: true, recursive: true })));
});

describe('findMissingBinaries', () => {
  test('returns [] when every platform dir has exactly one .node', async () => {
    const root = await createRoot();
    await createPlatformDir(root, 'darwin-arm64', ['passkeys.node']);
    await createPlatformDir(root, 'linux-x64', ['passkeys.node']);

    await expect(findMissingBinaries(root)).resolves.toEqual([]);
  });

  test('flags a dir with no .node files', async () => {
    const root = await createRoot();
    await createPlatformDir(root, 'darwin-arm64', ['README.md']);

    await expect(findMissingBinaries(root)).resolves.toEqual([{ dir: join(root, 'darwin-arm64'), count: 0 }]);
  });

  test('flags a dir with more than one .node file', async () => {
    const root = await createRoot();
    await createPlatformDir(root, 'darwin-arm64', ['passkeys.node', 'other.node']);

    await expect(findMissingBinaries(root)).resolves.toEqual([{ dir: join(root, 'darwin-arm64'), count: 2 }]);
  });
});

describe('formatBinaryCountError', () => {
  test('describes missing and duplicate binaries accurately', () => {
    expect(formatBinaryCountError('/tmp/darwin-arm64', 0)).toBe(
      '::error::/tmp/darwin-arm64 has 0 .node binaries (expected exactly 1); publishing it would ship an empty package',
    );

    expect(formatBinaryCountError('/tmp/darwin-arm64', 2)).toBe(
      '::error::/tmp/darwin-arm64 has 2 .node binaries (expected exactly 1); publishing it would ship an invalid package',
    );
  });
});
