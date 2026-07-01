import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type Clock, createRefreshScheduler } from '../refreshScheduler';

// leeway = max(BACKGROUND_REFRESH_THRESHOLD_IN_SECONDS=15, POLLER_INTERVAL/1000=5) = 15
// refresh lead time = 2, so a token fires its refresh at expiresAt - now - 17.
const NOW = 1000;

describe('createRefreshScheduler', () => {
  let now: number;
  const clock: Clock = { now: () => now };

  beforeEach(() => {
    now = NOW;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires onRefresh at expiresAt - now - 17 (43s for a fresh 60s token)', () => {
    const scheduler = createRefreshScheduler(clock);
    const onRefresh = vi.fn();
    scheduler.schedule('k', { expiresAt: now + 60, onExpire: vi.fn(), onRefresh });

    vi.advanceTimersByTime(42 * 1000);
    expect(onRefresh).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2 * 1000);
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('fires onExpire at expiresAt - now', () => {
    const scheduler = createRefreshScheduler(clock);
    const onExpire = vi.fn();
    scheduler.schedule('k', { expiresAt: now + 60, onExpire, onRefresh: vi.fn() });

    vi.advanceTimersByTime(59 * 1000);
    expect(onExpire).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1 * 1000);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('recomputes the refresh against the wall clock for a past-issuance token', () => {
    // Token minted 30s ago with a 60s TTL: exp is only 30s in the future, so the
    // refresh must fire at 30 - 17 = 13s, not at a fixed ttl - 17 = 43s.
    const scheduler = createRefreshScheduler(clock);
    const onRefresh = vi.fn();
    scheduler.schedule('k', { expiresAt: now + 30, onExpire: vi.fn(), onRefresh });

    vi.advanceTimersByTime(12 * 1000);
    expect(onRefresh).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1 * 1000);
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('does not arm a refresh timer when the refresh point is already in the past', () => {
    const scheduler = createRefreshScheduler(clock);
    const onRefresh = vi.fn();
    const onExpire = vi.fn();
    // 10s TTL: refresh point is 10 - 17 = -7 < 0, so only the expiration timer arms.
    scheduler.schedule('k', { expiresAt: now + 10, onExpire, onRefresh });

    vi.advanceTimersByTime(60 * 1000);
    expect(onRefresh).not.toHaveBeenCalled();
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('does not arm an expiration timer when the token is already expired', () => {
    const scheduler = createRefreshScheduler(clock);
    const onExpire = vi.fn();
    const onRefresh = vi.fn();
    scheduler.schedule('k', { expiresAt: now - 5, onExpire, onRefresh });

    vi.advanceTimersByTime(60 * 1000);
    expect(onExpire).not.toHaveBeenCalled();
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('does not arm a refresh timer when onRefresh is omitted', () => {
    const scheduler = createRefreshScheduler(clock);
    const onExpire = vi.fn();
    scheduler.schedule('k', { expiresAt: now + 60, onExpire });

    // Only the expiration timer should fire; nothing throws from a missing onRefresh.
    vi.advanceTimersByTime(60 * 1000);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('cancel() disarms both timers for a key before they fire', () => {
    const scheduler = createRefreshScheduler(clock);
    const onExpire = vi.fn();
    const onRefresh = vi.fn();
    scheduler.schedule('k', { expiresAt: now + 60, onExpire, onRefresh });

    scheduler.cancel('k');
    vi.advanceTimersByTime(120 * 1000);
    expect(onExpire).not.toHaveBeenCalled();
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('cancel() of an unknown key is a no-op', () => {
    const scheduler = createRefreshScheduler(clock);
    expect(() => scheduler.cancel('missing')).not.toThrow();
  });

  it('cancelAll() disarms every key', () => {
    const scheduler = createRefreshScheduler(clock);
    const a = vi.fn();
    const b = vi.fn();
    scheduler.schedule('a', { expiresAt: now + 60, onExpire: a, onRefresh: a });
    scheduler.schedule('b', { expiresAt: now + 60, onExpire: b, onRefresh: b });

    scheduler.cancelAll();
    vi.advanceTimersByTime(120 * 1000);
    expect(a).not.toHaveBeenCalled();
    expect(b).not.toHaveBeenCalled();
  });

  it('re-scheduling a key cancels the prior timers (no accumulation)', () => {
    const scheduler = createRefreshScheduler(clock);
    const first = vi.fn();
    const second = vi.fn();
    scheduler.schedule('k', { expiresAt: now + 60, onExpire: vi.fn(), onRefresh: first });
    scheduler.schedule('k', { expiresAt: now + 60, onExpire: vi.fn(), onRefresh: second });

    vi.advanceTimersByTime(60 * 1000);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('cancelling one key leaves another key armed', () => {
    const scheduler = createRefreshScheduler(clock);
    const a = vi.fn();
    const b = vi.fn();
    scheduler.schedule('a', { expiresAt: now + 60, onExpire: vi.fn(), onRefresh: a });
    scheduler.schedule('b', { expiresAt: now + 60, onExpire: vi.fn(), onRefresh: b });

    scheduler.cancel('a');
    vi.advanceTimersByTime(60 * 1000);
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);
  });
});
