import { createWorkerTimers } from '@clerk/shared';

import { SafeLock } from '../../../utils';

const REFRESH_SESSION_TOKEN_LOCK_KEY = 'clerk.lock.refreshSessionToken';
const INTERVAL_IN_MS = 5 * 1000;

export class AuthenticationPoller {
  private lock = SafeLock(REFRESH_SESSION_TOKEN_LOCK_KEY);
  private workerTimers = createWorkerTimers().workerTimers;
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
