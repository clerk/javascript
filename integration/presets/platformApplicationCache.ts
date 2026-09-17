import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import type { PlatformApplication } from './platformApplication';

type PlatformApplicationCacheOptions = {
  cachePath: string;
  create: () => Promise<PlatformApplication>;
  retryIntervalMs?: number;
  waitTimeoutMs?: number;
};

type PlatformApplicationCacheResult = {
  application: PlatformApplication;
  created: boolean;
};

const isPlatformApplication = (value: unknown): value is PlatformApplication => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const application = value as Partial<PlatformApplication>;
  return Boolean(application.applicationId && application.instanceId && application.pk && application.sk);
};

const readCachedPlatformApplication = async (cachePath: string): Promise<PlatformApplication | undefined> => {
  try {
    const cached: unknown = JSON.parse(await readFile(cachePath, 'utf8'));
    return isPlatformApplication(cached) ? cached : undefined;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT' || error instanceof SyntaxError) {
      return;
    }
    throw error;
  }
};

export const getOrCreateCachedPlatformApplication = async ({
  cachePath,
  create,
  retryIntervalMs = 100,
  waitTimeoutMs = 5 * 60 * 1000,
}: PlatformApplicationCacheOptions): Promise<PlatformApplicationCacheResult> => {
  const lockPath = `${cachePath}.lock`;
  const deadline = Date.now() + waitTimeoutMs;
  await mkdir(path.dirname(cachePath), { recursive: true });

  while (true) {
    const cached = await readCachedPlatformApplication(cachePath);
    if (cached) {
      return { application: cached, created: false };
    }

    try {
      await mkdir(lockPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
      if (Date.now() >= deadline) {
        throw new Error(`Timed out waiting for platform application cache at ${cachePath}.`);
      }
      await delay(retryIntervalMs);
      continue;
    }

    try {
      const cachedAfterLock = await readCachedPlatformApplication(cachePath);
      if (cachedAfterLock) {
        return { application: cachedAfterLock, created: false };
      }

      const application = await create();
      await writeFile(cachePath, JSON.stringify(application), { encoding: 'utf8', mode: 0o600 });
      return { application, created: true };
    } finally {
      await rm(lockPath, { recursive: true, force: true });
    }
  }
};
