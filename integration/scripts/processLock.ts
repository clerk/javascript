import * as path from 'node:path';

import { constants } from '../constants';

import { fs } from './index';

const LOCK_DIR = path.join(constants.TMP_DIR, '.locks');
const STALE_LOCK_MS = 120_000; // 2 minutes

/**
 * Acquire a file-based lock. Returns a release function.
 * If the lock is held by another process, polls until it becomes available.
 * Stale locks (older than STALE_LOCK_MS) are automatically reclaimed.
 */
export const acquireProcessLock = async (
  lockName: string,
  opts: { timeoutMs?: number; pollIntervalMs?: number } = {},
): Promise<() => void> => {
  const { timeoutMs = 180_000, pollIntervalMs = 500 } = opts;
  const lockFile = path.join(LOCK_DIR, `${lockName}.lock`);
  await fs.ensureDir(LOCK_DIR);

  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      // Atomic create — fails with EEXIST if lock is held
      fs.writeFileSync(lockFile, JSON.stringify({ pid: process.pid, time: Date.now() }), { flag: 'wx' });
      // Lock acquired
      return () => {
        try {
          fs.unlinkSync(lockFile);
        } catch {
          // Lock file already removed — not an error
        }
      };
    } catch (e: any) {
      if (e.code !== 'EEXIST') {
        throw e;
      }

      // Lock exists — check for staleness
      try {
        const content = fs.readFileSync(lockFile, 'utf-8');
        const { time } = JSON.parse(content);
        if (Date.now() - time > STALE_LOCK_MS) {
          // Stale lock — reclaim it
          fs.unlinkSync(lockFile);
          continue;
        }
      } catch {
        // Lock was released between our check and read — retry
        continue;
      }

      // Lock is held and not stale — wait
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  throw new Error(`Timed out waiting for lock "${lockName}" after ${timeoutMs}ms`);
};
