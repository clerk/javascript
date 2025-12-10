import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../resources/Token', () => {
  class MockToken {
    jwt?: { claims: any };

    constructor(data: any) {
      const raw = data?.jwt;
      if (raw) {
        const payload = raw.split('.')[1] || '';
        const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
        const paddingLength = normalized.length % 4 === 0 ? 0 : 4 - (normalized.length % 4);
        const decoded = Buffer.from(normalized + '='.repeat(paddingLength), 'base64').toString();
        const claims = JSON.parse(decoded);
        this.jwt = { claims: { ...claims, __raw: raw } };
      }
    }

    getRawString = () => {
      return this.jwt?.claims?.__raw || '';
    };
  }

  return { Token: MockToken };
});

import { Token } from '../../resources/Token';
import { TokenService } from '../TokenService';

const createJwt = (iat: number, exp: number) => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ exp, iat, sid: 'sess_123' })).toString('base64url');
  return `${header}.${payload}.signature`;
};

const createToken = (expiresInSeconds: number, issuedAtMs = Date.now()) => {
  const iat = Math.floor(issuedAtMs / 1000);
  const exp = iat + expiresInSeconds;
  return new Token({ jwt: createJwt(iat, exp), object: 'token' });
};

describe('TokenService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(0));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  it('transitions idle -> fetching -> valid on successful fetch', async () => {
    const fetcher = vi.fn().mockResolvedValue(createToken(60));
    const service = new TokenService('sess_1', { fetcher });

    const tokenPromise = service.getToken();
    expect(service.getState(service.buildCacheKey())).toMatchObject({ status: 'fetching' });

    const token = await tokenPromise;
    expect(token).toBeTruthy();
    expect(service.getState(service.buildCacheKey()).status).toBe('valid');
  });

  it('transitions idle -> fetching -> error on failed fetch', async () => {
    const failingError = Object.assign(new Error('fail'), { status: 400 });
    const fetcher = vi.fn().mockRejectedValue(failingError);
    const service = new TokenService('sess_1', { fetcher });

    await expect(service.getToken()).rejects.toThrow('fail');
    expect(service.getState(service.buildCacheKey()).status).toBe('error');
  });

  it('transitions valid -> refreshing -> valid on background refresh success', async () => {
    const firstToken = createToken(30);
    const refreshedToken = createToken(60);
    const fetcher = vi.fn().mockResolvedValueOnce(firstToken).mockResolvedValueOnce(refreshedToken);
    const service = new TokenService('sess_1', { fetcher, refreshBufferSeconds: 5 });

    await service.getToken();
    expect(service.getState(service.buildCacheKey()).status).toBe('valid');

    service.backgroundRefresh(service.buildCacheKey());
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));

    expect(fetcher).toHaveBeenCalledTimes(2);
    await vi.waitFor(() => expect(service.getState(service.buildCacheKey()).status).toBe('valid'));
    const state = service.getState(service.buildCacheKey());
    if (state.status === 'valid') {
      expect(state.token.getRawString()).toBe(refreshedToken.getRawString());
    }
    service.destroy();
  });

  it('keeps existing token when background refresh fails', async () => {
    const firstToken = createToken(30);
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(firstToken)
      .mockRejectedValueOnce(Object.assign(new Error('refresh-fail'), { status: 400 }));
    const service = new TokenService('sess_1', { fetcher, refreshBufferSeconds: 5 });

    const rawToken = await service.getToken();
    service.backgroundRefresh(service.buildCacheKey());
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));

    expect(fetcher).toHaveBeenCalledTimes(2);
    await vi.waitFor(() => expect(service.getState(service.buildCacheKey()).status).toBe('valid'));
    expect(await service.getToken()).toBe(rawToken);
    service.destroy();
  });

  it('coalesces concurrent getToken calls for same cache key', async () => {
    let resolveToken: (value: Token) => void;
    const fetcher = vi.fn().mockImplementation(
      () =>
        new Promise<Token>(resolve => {
          resolveToken = resolve;
        }),
    );
    const service = new TokenService('sess_1', { fetcher });

    const firstCall = service.getToken();
    const secondCall = service.getToken();

    resolveToken!(createToken(60));
    const [firstToken, secondToken] = await Promise.all([firstCall, secondCall]);

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(firstToken).toBe(secondToken);
  });

  it('does not coalesce calls with different cache keys', async () => {
    const fetcher = vi.fn().mockResolvedValue(createToken(60));
    const service = new TokenService('sess_1', { fetcher });

    await Promise.all([service.getToken({ template: 'a' }), service.getToken({ template: 'b' })]);

    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('returns cached token when valid', async () => {
    const fetcher = vi.fn().mockResolvedValue(createToken(60));
    const service = new TokenService('sess_1', { fetcher });

    const first = await service.getToken();
    const second = await service.getToken();

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
  });

  it('respects leewayInSeconds and refetches when within leeway', async () => {
    const fetcher = vi.fn().mockResolvedValue(createToken(20));
    const service = new TokenService('sess_1', { fetcher });

    await service.getToken();
    await service.getToken({ leewayInSeconds: 30 });

    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('fetches new token when skipCache is true', async () => {
    const fetcher = vi.fn().mockResolvedValue(createToken(60));
    const service = new TokenService('sess_1', { fetcher });

    await service.getToken({ skipCache: true });
    await service.getToken({ skipCache: true });

    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('invalidates specific cache key', async () => {
    const fetcher = vi.fn().mockResolvedValue(createToken(60));
    const service = new TokenService('sess_1', { fetcher });

    await service.getToken();
    const cacheKey = service.buildCacheKey();
    expect(service.hasValidToken(cacheKey)).toBe(true);

    service.invalidate(cacheKey);
    expect(service.hasValidToken(cacheKey)).toBe(false);
  });

  it('schedules proactive refresh before expiry', async () => {
    const fetcher = vi.fn().mockResolvedValue(createToken(20));
    const service = new TokenService('sess_1', { fetcher, refreshBufferSeconds: 5 });

    await service.getToken();
    const state = service.getState(service.buildCacheKey());
    expect(state.status).toBe('valid');
    if (state.status === 'valid') {
      expect(state.refreshTimeoutId).toBeTruthy();
    }
  });

  it('retries on transient errors', async () => {
    const fetcher = vi.fn().mockRejectedValueOnce(new Error('transient')).mockResolvedValue(createToken(60));
    const service = new TokenService('sess_1', { fetcher });

    const tokenPromise = service.getToken();
    await vi.advanceTimersByTimeAsync(3000);
    const token = await tokenPromise;

    expect(token).toBeTruthy();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('does not retry on 4xx errors', async () => {
    const error = Object.assign(new Error('4xx'), { status: 401 });
    const fetcher = vi.fn().mockRejectedValue(error);
    const service = new TokenService('sess_1', { fetcher });

    await expect(service.getToken()).rejects.toThrow('4xx');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('respects maxRetries', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('fail'));
    const service = new TokenService('sess_1', {
      fetcher,
      retryConfig: {
        factor: 1,
        initialDelayMs: 10,
        maxDelayMs: 20,
        maxRetries: 2,
        shouldRetry: () => true,
      },
    });

    const tokenPromise = service.getToken().catch(() => null);
    await vi.runAllTimersAsync();
    await tokenPromise;

    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it('ingests external token', () => {
    const service = new TokenService('sess_1', {
      fetcher: vi.fn(),
    });
    const cacheKey = service.buildCacheKey();
    const token = createToken(60);

    service.ingestToken(token, cacheKey);

    expect(service.hasValidToken(cacheKey)).toBe(true);
  });

  it('clears timers and invalidates on destroy', async () => {
    const fetcher = vi.fn().mockResolvedValue(createToken(60));
    const service = new TokenService('sess_1', { fetcher });

    await service.getToken();
    service.destroy();

    await expect(service.getToken()).rejects.toThrowError('TokenService has been destroyed');
  });
});
