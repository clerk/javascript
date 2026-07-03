import { afterEach, describe, expect, it, vi } from 'vitest';

import { timeLimit } from '../timeLimit';

describe('timeLimit', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('resolves with the value when the promise settles before ms', async () => {
    await expect(timeLimit(Promise.resolve('token'), 10_000)).resolves.toBe('token');
  });

  it('resolves cleanly when the value is a non-promise (e.g. undefined)', async () => {
    await expect(timeLimit(undefined, 10_000)).resolves.toBeUndefined();
  });

  it('rejects with a plain Error (no status) when ms elapses first', async () => {
    vi.useFakeTimers();
    const neverSettles = new Promise<string>(() => {});
    const result = timeLimit(neverSettles, 50).catch(error => error);

    await vi.advanceTimersByTimeAsync(50);

    const error = await result;
    expect(error).toBeInstanceOf(Error);
    expect((error as { status?: unknown }).status).toBeUndefined();
  });

  it('clears the timeout when the value settles first, leaving no pending timer', async () => {
    vi.useFakeTimers();
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout');

    await timeLimit(Promise.resolve('fast'), 10_000);

    expect(clearSpy).toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(10_000);
  });

  it('aborts the provided controller with the timeout error when ms elapses first', async () => {
    vi.useFakeTimers();
    const abort = vi.fn();
    const neverSettles = new Promise<string>(() => {});
    const result = timeLimit(neverSettles, 50, { abort }).catch(error => error);

    await vi.advanceTimersByTimeAsync(50);

    const error = await result;
    expect(abort).toHaveBeenCalledTimes(1);
    expect(abort).toHaveBeenCalledWith(error);
  });

  it('does not abort when the value settles before ms', async () => {
    const abort = vi.fn();

    await timeLimit(Promise.resolve('fast'), 10_000, { abort });

    expect(abort).not.toHaveBeenCalled();
  });
});
