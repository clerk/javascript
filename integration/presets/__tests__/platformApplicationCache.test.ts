import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import type { PlatformApplication } from '../platformApplication';
import { getOrCreateCachedPlatformApplication } from '../platformApplicationCache';

const tempDirs: string[] = [];
const application: PlatformApplication = {
  applicationId: 'app_1',
  instanceId: 'ins_1',
  pk: 'pk_test_1',
  sk: 'sk_test_1',
};

const createCachePath = async (): Promise<string> => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'platform-application-cache-'));
  tempDirs.push(tempDir);
  return path.join(tempDir, 'application.json');
};

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map(tempDir => rm(tempDir, { recursive: true, force: true })));
});

describe('getOrCreateCachedPlatformApplication', () => {
  it('returns an existing cached application', async () => {
    const cachePath = await createCachePath();
    const create = vi.fn();
    await writeFile(cachePath, JSON.stringify(application));

    await expect(getOrCreateCachedPlatformApplication({ cachePath, create })).resolves.toEqual({
      application,
      created: false,
    });
    expect(create).not.toHaveBeenCalled();
  });

  it('creates one application for concurrent cache misses', async () => {
    const cachePath = await createCachePath();
    let releaseCreation: () => void;
    const creationGate = new Promise<void>(resolve => {
      releaseCreation = resolve;
    });
    const create = vi.fn(async () => {
      await creationGate;
      return application;
    });

    const results = Array.from({ length: 4 }, () =>
      getOrCreateCachedPlatformApplication({ cachePath, create, retryIntervalMs: 1 }),
    );
    await vi.waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    releaseCreation!();

    const resolved = await Promise.all(results);
    expect(resolved.map(result => result.application)).toEqual([application, application, application, application]);
    expect(resolved.filter(result => result.created)).toHaveLength(1);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('releases the lock when application creation fails', async () => {
    const cachePath = await createCachePath();
    const create = vi.fn().mockRejectedValueOnce(new Error('creation failed')).mockResolvedValueOnce(application);

    await expect(getOrCreateCachedPlatformApplication({ cachePath, create })).rejects.toThrow('creation failed');
    await expect(getOrCreateCachedPlatformApplication({ cachePath, create })).resolves.toEqual({
      application,
      created: true,
    });
    expect(create).toHaveBeenCalledTimes(2);
  });
});
