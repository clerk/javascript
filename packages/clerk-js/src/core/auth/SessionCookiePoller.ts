import { createWorkerTimers } from '@clerk/shared/workerTimers';

import { isTabFocused } from '@/utils/isTabFocused';

import { SafeLock } from './safeLock';

const REFRESH_SESSION_TOKEN_LOCK_KEY = 'clerk.lock.refreshSessionToken';

export const POLLER_INTERVAL_IN_MS = 5 * 1_000;
export const FOCUSED_POLLER_INTERVAL_IN_MS = 1_500;

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
      const interval = isTabFocused() === true ? FOCUSED_POLLER_INTERVAL_IN_MS : POLLER_INTERVAL_IN_MS;
      this.timerId = this.workerTimers.setTimeout(run, interval);
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
