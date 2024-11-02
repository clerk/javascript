import { createWorkerTimers } from '@clerk/shared/workerTimers';

import { SafeLock } from './safeLock';

const REFRESH_SESSION_TOKEN_LOCK_KEY = 'clerk.lock.refreshSessionToken';
const INTERVAL_IN_MS = 5 * 1000;

export class SessionCookiePoller {
  private lock = SafeLock(REFRESH_SESSION_TOKEN_LOCK_KEY);
  private workerTimers = createWorkerTimers();
  private timerId: ReturnType<typeof this.workerTimers.setInterval> | null = null;

  public startPollingForSessionToken(cb: () => unknown): void {
    if (this.timerId) {
      return;
    }

    this.timerId = this.workerTimers.setInterval(() => {
      void this.lock.acquireLockAndRun(cb);
    }, INTERVAL_IN_MS);
  }

  public stopPollingForSessionToken(): void {
    if (this.timerId) {
      this.workerTimers.clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
