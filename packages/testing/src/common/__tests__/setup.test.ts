import { ClerkAPIResponseError } from '@clerk/shared/error';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Re-export internals for testing by importing the module and testing through fetchEnvVars
// Since fetchWithRetry and isNetworkError are not exported, we test them indirectly through fetchEnvVars
// and also directly by extracting them via a test-specific import approach.

// We need to mock the dependencies before importing the module under test
vi.mock('@clerk/backend', () => ({
  createClerkClient: vi.fn(),
}));

vi.mock('dotenv', () => ({
  default: { config: vi.fn() },
}));

vi.mock('@clerk/shared/keys', () => ({
  parsePublishableKey: vi.fn(() => ({ frontendApi: 'clerk.test.lcl.dev' })),
}));

import { createClerkClient } from '@clerk/backend';
import { fetchEnvVars } from '../setup';

function createClerkAPIError(status: number, retryAfter?: number) {
  return new ClerkAPIResponseError('API error', {
    data: [],
    status,
    retryAfter,
  });
}

function createNetworkError(code: string) {
  const err = new Error(`connect ${code}`);
  (err as NodeJS.ErrnoException).code = code;
  return err;
}

describe('fetchWithRetry (via fetchEnvVars)', () => {
  const mockCreateTestingToken = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv('CLERK_PUBLISHABLE_KEY', 'pk_test_abc');
    vi.stubEnv('CLERK_SECRET_KEY', 'sk_test_abc');
    delete process.env.CLERK_TESTING_TOKEN;

    vi.mocked(createClerkClient).mockReturnValue({
      testingTokens: { createTestingToken: mockCreateTestingToken },
    } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('returns on first success without retrying', async () => {
    mockCreateTestingToken.mockResolvedValueOnce({ token: 'test-token' });

    const result = await fetchEnvVars({ dotenv: false });

    expect(result.CLERK_TESTING_TOKEN).toBe('test-token');
    expect(mockCreateTestingToken).toHaveBeenCalledTimes(1);
  });

  it('retries on 429 and succeeds', async () => {
    mockCreateTestingToken
      .mockRejectedValueOnce(createClerkAPIError(429))
      .mockResolvedValueOnce({ token: 'test-token' });

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const promise = fetchEnvVars({ dotenv: false });
    await vi.advanceTimersByTimeAsync(30_000);
    const result = await promise;

    expect(result.CLERK_TESTING_TOKEN).toBe('test-token');
    expect(mockCreateTestingToken).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain('[Retry] 429');
    expect(warnSpy.mock.calls[0][0]).toContain('attempt 1/5');
  });

  it.each([408, 500, 502, 503, 504])('retries on %i status code', async status => {
    mockCreateTestingToken
      .mockRejectedValueOnce(createClerkAPIError(status))
      .mockResolvedValueOnce({ token: 'test-token' });

    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const promise = fetchEnvVars({ dotenv: false });
    await vi.advanceTimersByTimeAsync(30_000);
    const result = await promise;

    expect(result.CLERK_TESTING_TOKEN).toBe('test-token');
    expect(mockCreateTestingToken).toHaveBeenCalledTimes(2);
  });

  it('does not retry on non-retryable status codes', async () => {
    mockCreateTestingToken.mockRejectedValueOnce(createClerkAPIError(401));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(fetchEnvVars({ dotenv: false })).rejects.toThrow('API error');
    expect(mockCreateTestingToken).toHaveBeenCalledTimes(1);
  });

  it('throws after max retries exhausted', async () => {
    mockCreateTestingToken.mockImplementation(() => Promise.reject(createClerkAPIError(429)));

    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const promise = fetchEnvVars({ dotenv: false }).catch(e => e);

    await vi.runAllTimersAsync();

    const error = await promise;
    expect(error).toBeInstanceOf(ClerkAPIResponseError);
    expect(error.status).toBe(429);
    // 1 initial + 5 retries = 6 total calls
    expect(mockCreateTestingToken).toHaveBeenCalledTimes(6);
  });

  it('uses retryAfter from error when available', async () => {
    mockCreateTestingToken
      .mockRejectedValueOnce(createClerkAPIError(429, 2))
      .mockResolvedValueOnce({ token: 'test-token' });

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const promise = fetchEnvVars({ dotenv: false });

    // retryAfter is 2 seconds = 2000ms
    await vi.advanceTimersByTimeAsync(2000);
    const result = await promise;

    expect(result.CLERK_TESTING_TOKEN).toBe('test-token');
    expect(warnSpy.mock.calls[0][0]).toContain('waiting 2000ms');
  });

  it('caps retryAfter delay at MAX_RETRY_DELAY_MS', async () => {
    mockCreateTestingToken
      .mockRejectedValueOnce(createClerkAPIError(429, 60))
      .mockResolvedValueOnce({ token: 'test-token' });

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const promise = fetchEnvVars({ dotenv: false });
    await vi.advanceTimersByTimeAsync(30_000);
    const result = await promise;

    expect(result.CLERK_TESTING_TOKEN).toBe('test-token');
    // 60s * 1000 = 60000ms, capped to 30000ms
    expect(warnSpy.mock.calls[0][0]).toContain('waiting 30000ms');
  });

  it.each(['ECONNREFUSED', 'ECONNRESET', 'ENOTFOUND', 'ETIMEDOUT', 'EAI_AGAIN'])(
    'retries on network error %s',
    async code => {
      mockCreateTestingToken
        .mockRejectedValueOnce(createNetworkError(code))
        .mockResolvedValueOnce({ token: 'test-token' });

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const promise = fetchEnvVars({ dotenv: false });
      await vi.advanceTimersByTimeAsync(30_000);
      const result = await promise;

      expect(result.CLERK_TESTING_TOKEN).toBe('test-token');
      expect(mockCreateTestingToken).toHaveBeenCalledTimes(2);
      expect(warnSpy.mock.calls[0][0]).toContain(`[Retry] ${code}`);
    },
  );

  it('does not retry on non-network errors', async () => {
    mockCreateTestingToken.mockRejectedValueOnce(new TypeError('unexpected'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(fetchEnvVars({ dotenv: false })).rejects.toThrow('unexpected');
    expect(mockCreateTestingToken).toHaveBeenCalledTimes(1);
  });

  it('does not retry when non-retryable error code is present', async () => {
    const err = new Error('unknown');
    (err as NodeJS.ErrnoException).code = 'EPERM';
    vi.spyOn(console, 'error').mockImplementation(() => {});

    mockCreateTestingToken.mockRejectedValueOnce(err);

    await expect(fetchEnvVars({ dotenv: false })).rejects.toThrow('unknown');
    expect(mockCreateTestingToken).toHaveBeenCalledTimes(1);
  });

  it('skips retry when CLERK_TESTING_TOKEN is already set', async () => {
    vi.stubEnv('CLERK_TESTING_TOKEN', 'existing-token');

    const result = await fetchEnvVars({ dotenv: false });

    expect(result.CLERK_TESTING_TOKEN).toBe('existing-token');
    expect(mockCreateTestingToken).not.toHaveBeenCalled();
  });
});
