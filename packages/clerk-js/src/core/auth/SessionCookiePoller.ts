import { createWorkerTimers } from '@clerk/shared/workerTimers';

import type { SafeLockReturn } from './safeLock';
import { SafeLock } from './safeLock';

export const REFRESH_SESSION_TOKEN_LOCK_KEY = 'clerk.lock.refreshSessionToken';
const INTERVAL_IN_MS = 5 * 1_000;

export class SessionCookiePoller {
  private lock: SafeLockReturn;
  private workerTimers = createWorkerTimers();
  private timerId: ReturnType<typeof this.workerTimers.setInterval> | null = null;
  // Disallows for multiple `startPollingForSessionToken()` calls before `callback` is executed.
  private initiated = false;

  constructor(lock?: SafeLockReturn) {
    this.lock = lock ?? SafeLock(REFRESH_SESSION_TOKEN_LOCK_KEY);
  }

  public startPollingForSessionToken(cb: () => Promise<unknown>): void {
    if (this.timerId || this.initiated) {
      return;
    }

    const run = async () => {
      this.initiated = true;
      await this.lock.acquireLockAndRun(cb);
      this.timerId = this.workerTimers.setTimeout(run, INTERVAL_IN_MS);
    };

    void run();
  }

  public stopPollingForSessionToken(): void {
    // Note: `timerId` can be 0.
    if (this.timerId != null) {
      this.workerTimers.clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.initiated = false;
  }
}
