/**
 * Owns the per-token timers for the session token cache: an expiration-cleanup
 * timer and a proactive background-refresh timer. Keeping the scheduling out of
 * the storage layer lets the cache deal in opaque keys and makes timer behavior
 * independently testable through an injected clock.
 *
 * Timers are still backed by `setTimeout`; the injected clock only supplies
 * `now()` so the fire times can be recomputed against the wall clock (a token
 * issued before the tab loaded refreshes at its true expiry, not relative to
 * when it was cached).
 */

import { POLLER_INTERVAL_IN_MS } from './auth/SessionCookiePoller';

/**
 * Seconds before token expiration to trigger a proactive background refresh.
 * Sized to absorb timer jitter, SafeLock contention (~5s), and network latency.
 */
const BACKGROUND_REFRESH_THRESHOLD_IN_SECONDS = 15;

/**
 * Seconds of buffer before the leeway window so a refresh completes before the
 * old token enters leeway. Token fetches typically finish in ~100ms; 2s is ample.
 */
const REFRESH_LEAD_TIME_IN_SECONDS = 2;

/**
 * Source of the current time, in seconds since the UNIX epoch. Injected so timer
 * fire points are deterministic in tests; defaults to the wall clock.
 */
export interface Clock {
  now(): number;
}

/** The production wall clock, in seconds since the UNIX epoch. */
export const systemClock: Clock = { now: () => Date.now() / 1000 };

interface ScheduleParams {
  /** Absolute expiry of the token, in seconds since the UNIX epoch (JWT `exp`). */
  expiresAt: number;
  /** Invoked when the expiration-cleanup timer fires. */
  onExpire: () => void;
  /** Invoked when the proactive-refresh timer fires. Omit to skip the refresh timer. */
  onRefresh?: () => void;
}

export interface RefreshScheduler {
  /**
   * Arms the expiration and proactive-refresh timers for a key, cancelling any
   * prior timers for that key first. Delays are recomputed against the clock, so
   * an already-expired or past-issuance token arms only the timers that are still
   * in the future.
   */
  schedule(key: string, params: ScheduleParams): void;
  /** Cancels both timers for a single key. */
  cancel(key: string): void;
  /** Cancels every key's timers (for cache `clear()`). */
  cancelAll(): void;
}

interface TimerHandles {
  expirationTimer?: ReturnType<typeof setTimeout>;
  refreshTimer?: ReturnType<typeof setTimeout>;
}

// Teach ClerkJS not to block the exit of the event loop in Node environments.
// https://nodejs.org/api/timers.html#timeoutunref
const armTimer = (callback: () => void, delayMs: number): ReturnType<typeof setTimeout> => {
  const id = setTimeout(callback, delayMs);
  if (typeof (id as any).unref === 'function') {
    (id as any).unref();
  }
  return id;
};

const clearHandles = (handles: TimerHandles) => {
  if (handles.expirationTimer !== undefined) {
    clearTimeout(handles.expirationTimer);
  }
  if (handles.refreshTimer !== undefined) {
    clearTimeout(handles.refreshTimer);
  }
};

/**
 * Creates a {@link RefreshScheduler} bound to a {@link Clock} (defaults to the wall clock).
 */
export const createRefreshScheduler = (clock: Clock = systemClock): RefreshScheduler => {
  const timers = new Map<string, TimerHandles>();

  const cancel = (key: string) => {
    const handles = timers.get(key);
    if (!handles) {
      return;
    }
    clearHandles(handles);
    timers.delete(key);
  };

  const cancelAll = () => {
    timers.forEach(clearHandles);
    timers.clear();
  };

  const schedule = (key: string, { expiresAt, onExpire, onRefresh }: ScheduleParams) => {
    cancel(key);

    const now = clock.now();
    const handles: TimerHandles = {};

    const expirationDelay = (expiresAt - now) * 1000;
    if (expirationDelay > 0) {
      handles.expirationTimer = armTimer(onExpire, expirationDelay);
    }

    const leeway = Math.max(BACKGROUND_REFRESH_THRESHOLD_IN_SECONDS, POLLER_INTERVAL_IN_MS / 1000);
    const refreshDelay = (expiresAt - now - leeway - REFRESH_LEAD_TIME_IN_SECONDS) * 1000;
    if (refreshDelay > 0 && onRefresh) {
      handles.refreshTimer = armTimer(() => onRefresh(), refreshDelay);
    }

    timers.set(key, handles);
  };

  return { schedule, cancel, cancelAll };
};
