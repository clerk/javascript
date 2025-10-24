import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { retry } from '../retry';

describe('retry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('resolves with the result of the callback', async () => {
    const result = await retry(() => Promise.resolve('success'));
    expect(result).toBe('success');
  });

  test('retries the callback until it succeeds', async () => {
    let attempts = 0;
    const result = retry(
      () => {
        attempts++;
        if (attempts < 2) {
          throw new Error('failed');
        }
        return Promise.resolve('success');
      },
      {
        initialDelay: 100,
        factor: 1,
        jitter: false,
      },
    );
    await vi.advanceTimersByTimeAsync(200);
    expect(await result).toBe('success');
    expect(attempts).toBe(2);
  });

  test('maxDelayBetweenRetries prevents delays from growing beyond the limit', async () => {
    vi.useFakeTimers();
    let attempts = 0;

    retry(
      () => {
        attempts++;
        throw new Error('failed');
      },
      {
        maxDelayBetweenRetries: 300,
        initialDelay: 100,
        factor: 3,
        jitter: false,
        shouldRetry: (_, count) => count <= 4,
      },
    ).catch(e => {
      expect(e.message).toBe('failed');
    });

    // Run all timer advances before testing the promise
    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(300);
    await vi.advanceTimersByTimeAsync(300);
    await vi.advanceTimersByTimeAsync(300);
    expect(attempts).toBe(1 + 4);
    vi.useRealTimers();
  });

  test('respects initialDelay option', async () => {
    let attempts = 0;
    retry(
      () => {
        attempts++;
        throw new Error('failed');
      },
      { initialDelay: 200, jitter: false, shouldRetry: (_, count) => count <= 2 },
    ).catch(() => {});

    expect(attempts).toBe(1);
    await vi.advanceTimersByTimeAsync(200);
    expect(attempts).toBe(2);
    await vi.advanceTimersByTimeAsync(400);
    expect(attempts).toBe(3);
  });

  test('respects retryImmediately option', async () => {
    let attempts = 0;
    retry(
      () => {
        attempts++;
        throw new Error('failed');
      },
      {
        initialDelay: 1000,
        retryImmediately: true,
        jitter: false,
        shouldRetry: (_, count) => count <= 2,
      },
    ).catch(() => {});

    expect(attempts).toBe(1);
    await vi.advanceTimersByTimeAsync(101);
    expect(attempts).toBe(2);
    await vi.advanceTimersByTimeAsync(1000);
    expect(attempts).toBe(3);
  });

  test('disables immediate retry when retryImmediately is false', async () => {
    let attempts = 0;
    retry(
      () => {
        attempts++;
        throw new Error('failed');
      },
      {
        initialDelay: 200,
        retryImmediately: false,
        jitter: false,
        shouldRetry: (_, count) => count <= 2,
      },
    ).catch(() => {});

    expect(attempts).toBe(1);
    await vi.advanceTimersByTimeAsync(200);
    expect(attempts).toBe(2);
    await vi.advanceTimersByTimeAsync(400);
    expect(attempts).toBe(3);
  });

  test('respects shouldRetry custom logic', async () => {
    let attempts = 0;
    const error = new Error('special error');

    await retry(
      () => {
        attempts++;
        throw error;
      },
      {
        initialDelay: 100,
        jitter: false,
        shouldRetry: e => (e as Error).message !== 'special error',
      },
    ).catch(e => {
      expect(e).toBe(error);
    });

    expect(attempts).toBe(1);
  });

  test('respects factor for exponential backoff', async () => {
    let attempts = 0;
    retry(
      () => {
        attempts++;
        throw new Error('failed');
      },
      {
        initialDelay: 100,
        factor: 4,
        jitter: false,
        shouldRetry: (_, count) => count <= 3,
      },
    ).catch(() => {});

    expect(attempts).toBe(1);
    await vi.advanceTimersByTimeAsync(100);
    expect(attempts).toBe(2);
    await vi.advanceTimersByTimeAsync(400);
    expect(attempts).toBe(3);
    await vi.advanceTimersByTimeAsync(1600);
    expect(attempts).toBe(4);
  });

  test('applies jitter by default', async () => {
    let attempts = 0;

    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    retry(
      () => {
        attempts++;
        throw new Error('failed');
      },
      {
        initialDelay: 100,
        factor: 1,
        shouldRetry: (_, count) => count <= 2,
      },
    ).catch(() => {});

    // First attempt that triggers the retry
    expect(attempts).toBe(1);
    // Flush all microtasks
    await Promise.resolve();
    // Normal delay without jitter
    await vi.advanceTimersByTimeAsync(100);
    // But the attempt is still 1 because with the jitter enabled,
    // the delay is now 150
    expect(attempts).toBe(1);
    // Wait for 50ms more (100 + 50)
    await vi.advanceTimersByTimeAsync(50);
    // Should now reach the second attempt
    expect(attempts).toBe(2);
    await vi.advanceTimersByTimeAsync(150);
    expect(attempts).toBe(3);
    await vi.advanceTimersByTimeAsync(150);
    expect(attempts).toBe(3);
  });
});
