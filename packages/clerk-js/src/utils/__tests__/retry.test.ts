import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { withRetry } from '../retry';

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns result on first successful attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');

    const promise = withRetry(fn, {
      maxAttempts: 3,
      shouldRetry: () => true,
    });

    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure when shouldRetry returns true', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('first failure'))
      .mockRejectedValueOnce(new Error('second failure'))
      .mockResolvedValue('success');

    const promise = withRetry(fn, {
      maxAttempts: 3,
      shouldRetry: () => true,
    });

    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('does not retry when shouldRetry returns false', async () => {
    const error = new Error('failure');
    const fn = vi.fn().mockRejectedValue(error);

    const promise = withRetry(fn, {
      maxAttempts: 3,
      shouldRetry: () => false,
    });

    // Attach rejection handler before advancing timers to avoid unhandled rejection
    const expectation = expect(promise).rejects.toThrow('failure');
    await vi.runAllTimersAsync();
    await expectation;
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throws after exhausting all retry attempts', async () => {
    const error = new Error('persistent failure');
    const fn = vi.fn().mockRejectedValue(error);

    const promise = withRetry(fn, {
      maxAttempts: 3,
      shouldRetry: () => true,
    });

    // Attach rejection handler before advancing timers to avoid unhandled rejection
    const expectation = expect(promise).rejects.toThrow('persistent failure');
    await vi.runAllTimersAsync();
    await expectation;
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('applies exponential backoff between retries', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('first failure'))
      .mockRejectedValueOnce(new Error('second failure'))
      .mockResolvedValue('success');

    const promise = withRetry(fn, {
      jitter: false,
      maxAttempts: 3,
      shouldRetry: () => true,
    });

    await vi.advanceTimersByTimeAsync(0);
    expect(fn).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(2000);
    expect(fn).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(4000);
    expect(fn).toHaveBeenCalledTimes(3);

    const result = await promise;
    expect(result).toBe('success');
  });

  it('supports async shouldRetry predicate', async () => {
    const error = new Error('failure');
    const fn = vi.fn().mockRejectedValue(error);

    const shouldRetry = vi.fn().mockResolvedValue(false);

    const promise = withRetry(fn, {
      maxAttempts: 3,
      shouldRetry,
    });

    // Attach rejection handler before advancing timers to avoid unhandled rejection
    const expectation = expect(promise).rejects.toThrow('failure');
    await vi.runAllTimersAsync();
    await expectation;

    expect(shouldRetry).toHaveBeenCalledTimes(1);
    expect(shouldRetry).toHaveBeenCalledWith(error);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('calls shouldRetry with the error for each attempt', async () => {
    const errors = [new Error('first'), new Error('second')];
    const fn = vi.fn().mockRejectedValueOnce(errors[0]).mockRejectedValueOnce(errors[1]).mockResolvedValue('success');

    const shouldRetry = vi.fn().mockReturnValue(true);

    const promise = withRetry(fn, {
      maxAttempts: 3,
      shouldRetry,
    });

    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('success');
    expect(shouldRetry).toHaveBeenCalledTimes(2);
    expect(shouldRetry).toHaveBeenNthCalledWith(1, errors[0]);
    expect(shouldRetry).toHaveBeenNthCalledWith(2, errors[1]);
  });

  it('applies jitter to backoff by default', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('failure'));

    const promise = withRetry(fn, {
      maxAttempts: 2,
      shouldRetry: () => true,
    });

    // Attach rejection handler before advancing timers to avoid unhandled rejection
    const expectation = expect(promise).rejects.toThrow('failure');

    await vi.advanceTimersByTimeAsync(0);
    expect(fn).toHaveBeenCalledTimes(1);

    await vi.runAllTimersAsync();
    expect(fn).toHaveBeenCalledTimes(2);

    await expectation;
  });
});
