import { SafeLock } from '../../../utils';

const REFRESH_SESSION_TOKEN_LOCK_KEY = 'clerk.lock.refreshSessionToken';
const INTERVAL_IN_MS = 5 * 1000;

export class AuthenticationPoller {
  private lock = SafeLock(REFRESH_SESSION_TOKEN_LOCK_KEY);
  private poller: ReturnType<typeof setInterval> | null = null;

  public startPollingForSessionToken(cb: () => unknown): void {
    if (this.poller) {
      return;
    }

    this.poller = setInterval(() => {
      void this.lock.acquireLockAndRun(cb);
    }, INTERVAL_IN_MS);
  }

  public stopPollingForSessionToken(): void {
    if (this.poller) {
      clearInterval(this.poller);
      this.poller = null;
    }
  }
}
