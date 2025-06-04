import { createWorkerTimers } from '@clerk/shared/workerTimers';

import { SafeLock } from './safeLock';

const REFRESH_SESSION_TOKEN_LOCK_KEY = 'clerk.lock.refreshSessionToken';

/**
 * Returns an interval in milliseconds with random jitter.
 * Uses a base interval of 5 seconds and adds up to 1.5 seconds of random jitter.
 * This randomization helps prevent synchronized polling requests across multiple clients.
 */
const getIntervalInMs = () => {
  const jitter = Math.random() * 1500;
  return 5 * 1_000 + jitter;
};

export class SessionCookiePoller {
  private lock = SafeLock(REFRESH_SESSION_TOKEN_LOCK_KEY);
  private workerTimers = createWorkerTimers();
  private timerId: ReturnType<typeof this.workerTimers.setInterval> | null = null;
  // Disallows for multiple `startPollingForSessionToken()` calls before `callback` is executed.
  private initiated = false;

  public startPollingForSessionToken(cb: () => Promise<unknown>): void {
    if (this.timerId || this.initiated) {
      return;
    }

    const run = async () => {
      this.initiated = true;
      await this.lock.acquireLockAndRun(cb);
      this.timerId = this.workerTimers.setTimeout(run, getIntervalInMs());
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
