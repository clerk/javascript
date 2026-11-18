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

async function createPlatformDir(root, name, nodeFiles, main = 'passkeys.node') {
  const dir = join(root, name);
  await mkdir(dir, { recursive: true });

  await Promise.all([
    writeFile(join(dir, 'package.json'), `${JSON.stringify({ files: [main], main }, null, 2)}\n`),
    ...nodeFiles.map(file => writeFile(join(dir, file), '')),
  ]);

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

  test('flags a dir where the declared binary is missing', async () => {
    const root = await createRoot();
    await createPlatformDir(root, 'darwin-arm64', ['other.node'], 'passkeys.node');

    await expect(findMissingBinaries(root)).resolves.toEqual([
      { count: 1, dir: join(root, 'darwin-arm64'), expectedFile: 'passkeys.node' },
    ]);
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
