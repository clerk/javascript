import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { getPublicPackages, getUnavailablePackages, waitForPackagesOnNpm } from './wait-for-packages-on-npm.mjs';

const roots = [];

async function createManifest(root, directory, packageJson) {
  const packageDirectory = join(root, directory);
  await mkdir(packageDirectory, { recursive: true });
  await writeFile(join(packageDirectory, 'package.json'), `${JSON.stringify(packageJson)}\n`);
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map(root => rm(root, { force: true, recursive: true })));
});

describe('getPublicPackages', () => {
  test('returns sorted public package versions', async () => {
    const root = await mkdtemp(join(tmpdir(), 'npm-availability-'));
    roots.push(root);

    await createManifest(root, 'packages/zeta', { name: '@clerk/zeta', version: '2.0.0' });
    await createManifest(root, 'packages/alpha', { name: '@clerk/alpha', version: '1.0.0' });
    await createManifest(root, 'packages/private', { name: '@clerk/private', private: true, version: '1.0.0' });

    await expect(getPublicPackages([join(root, 'packages/*/package.json')])).resolves.toEqual([
      { name: '@clerk/alpha', version: '1.0.0' },
      { name: '@clerk/zeta', version: '2.0.0' },
    ]);
  });
});

describe('getUnavailablePackages', () => {
  test('returns failed responses and network errors', async () => {
    const packages = [
      { name: '@clerk/available', version: '1.0.0' },
      { name: '@clerk/missing', version: '2.0.0' },
      { name: '@clerk/error', version: '3.0.0' },
    ];
    const fetchPackage = vi.fn(url => {
      if (url.includes('/available/')) {
        return { ok: true, status: 200 };
      }
      if (url.includes('/missing/')) {
        return { ok: false, status: 404 };
      }
      throw new Error('network unavailable');
    });

    await expect(getUnavailablePackages(packages, fetchPackage)).resolves.toEqual([
      { name: '@clerk/missing', version: '2.0.0', status: 404 },
      { name: '@clerk/error', version: '3.0.0', error: 'network unavailable' },
    ]);
  });
});

describe('waitForPackagesOnNpm', () => {
  test('retries only unavailable packages', async () => {
    const packages = [
      { name: '@clerk/available', version: '1.0.0' },
      { name: '@clerk/delayed', version: '2.0.0' },
    ];
    const attempts = new Map();
    const fetchPackage = vi.fn(url => {
      const count = (attempts.get(url) ?? 0) + 1;
      attempts.set(url, count);
      return { ok: !url.includes('/delayed/') || count === 2, status: 200 };
    });
    const sleep = vi.fn();
    const log = vi.fn();

    await waitForPackagesOnNpm(packages, { fetchPackage, maxAttempts: 3, delayMs: 1, sleep, log });

    expect(fetchPackage).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledTimes(1);
    expect(sleep).toHaveBeenCalledWith(1);
    expect(log).toHaveBeenLastCalledWith('All 2 public package versions are available on npm.');
  });

  test('throws after exhausting retries', async () => {
    const packages = [{ name: '@clerk/missing', version: '1.0.0' }];
    const fetchPackage = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    const sleep = vi.fn();

    await expect(
      waitForPackagesOnNpm(packages, { fetchPackage, maxAttempts: 2, delayMs: 1, sleep, log: vi.fn() }),
    ).rejects.toThrow('Package versions did not become available on npm after 2 attempts: @clerk/missing@1.0.0');
    expect(fetchPackage).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledTimes(1);
    expect(sleep).toHaveBeenCalledWith(1);
  });
});
