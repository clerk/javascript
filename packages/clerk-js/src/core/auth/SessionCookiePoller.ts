import { createWorkerTimers } from '@clerk/shared/workerTimers';

const INTERVAL_IN_MS = 5 * 1_000;

/**
 * Polls for session token refresh at regular intervals.
 *
 * Note: Cross-tab coordination is handled within Session.getToken() itself,
 * so this poller simply triggers the refresh callback without additional locking.
 */
export class SessionCookiePoller {
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
      await cb();
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
