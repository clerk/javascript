import type { TokenResource } from '@clerk/shared/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mockJwt } from '@/test/core-fixtures';

import { Token } from '../resources/internal';
import { SessionTokenCache } from '../tokenCache';

interface SessionTokenEvent {
  organizationId?: string | null;
  sessionId: string;
  template?: string;
  tokenId: string;
  tokenRaw: string;
  traceId: string;
}

/**
 * Helper to create a JWT with custom TTL for testing expiration scenarios
 */
function createJwtWithTtl(iatSeconds: number, ttlSeconds: number): string {
  const payload = {
    data: 'test-data',
    exp: iatSeconds + ttlSeconds,
    iat: iatSeconds,
  };
  const payloadString = JSON.stringify(payload);
  const payloadB64 = btoa(payloadString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const headerB64 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
  const signature = 'test-signature';
  return `${headerB64}.${payloadB64}.${signature}`;
}

describe('SessionTokenCache', () => {
  let mockBroadcastChannel: {
    addEventListener: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
    postMessage: ReturnType<typeof vi.fn>;
  };
  let broadcastListener: (e: MessageEvent<SessionTokenEvent>) => void;
  let originalBroadcastChannel: any;

  beforeEach(() => {
    // Mock Date.now() to make the test tokens appear valid
    // mockJwt has iat: 1666648250, exp: 1666648310
    // Set current time to 1666648260 (10 seconds after iat, 50 seconds before exp)
    vi.useFakeTimers();
    vi.setSystemTime(new Date(1666648260 * 1000));

    mockBroadcastChannel = {
      addEventListener: vi.fn((eventName, listener) => {
        if (eventName === 'message') {
          broadcastListener = listener;
        }
      }),
      close: vi.fn(),
      postMessage: vi.fn(),
    };

    originalBroadcastChannel = global.BroadcastChannel;

    // Close any existing BroadcastChannel from module load or previous tests
    SessionTokenCache.close();

    // Now mock BroadcastChannel so next initialization uses the mock
    global.BroadcastChannel = vi.fn(() => mockBroadcastChannel) as any;

    SessionTokenCache.clear();

    // Trigger broadcast channel initialization by calling set() once
    // This ensures broadcastListener is set up for tests that simulate broadcast messages
    SessionTokenCache.set({
      tokenId: '__init__',
      tokenResolver: Promise.resolve({} as any),
    });
    SessionTokenCache.clear();
  });

  afterEach(() => {
    SessionTokenCache.clear();
    SessionTokenCache.close();
    global.BroadcastChannel = originalBroadcastChannel;
    vi.useRealTimers();
  });

  describe('broadcast message handling', () => {
    it('ignores broadcasts with mismatched tokenId', () => {
      const event: MessageEvent<SessionTokenEvent> = {
        data: {
          organizationId: null,
          sessionId: 'session_123',
          template: undefined,
          tokenId: 'wrong-token-id',
          tokenRaw: mockJwt,
          traceId: 'test_trace_1',
        },
      } as MessageEvent<SessionTokenEvent>;

      broadcastListener(event);

      expect(SessionTokenCache.size()).toBe(0);
    });

    it('validates tokenId matches expected format for templates', () => {
      const event: MessageEvent<SessionTokenEvent> = {
        data: {
          organizationId: null,
          sessionId: 'session_123',
          template: 'my-template',
          tokenId: 'session_123-my-template',
          tokenRaw: mockJwt,
          traceId: 'test_trace_2',
        },
      } as MessageEvent<SessionTokenEvent>;

      broadcastListener(event);

      expect(SessionTokenCache.size()).toBe(1);
    });

    it('validates tokenId matches expected format for organization tokens', () => {
      const event: MessageEvent<SessionTokenEvent> = {
        data: {
          organizationId: 'org_456',
          sessionId: 'session_123',
          template: undefined,
          tokenId: 'session_123-org_456',
          tokenRaw: mockJwt,
          traceId: 'test_trace_3',
        },
      } as MessageEvent<SessionTokenEvent>;

      broadcastListener(event);

      expect(SessionTokenCache.size()).toBe(1);
    });

    it('gracefully handles invalid JWT without crashing', () => {
      const event: MessageEvent<SessionTokenEvent> = {
        data: {
          organizationId: null,
          sessionId: 'session_123',
          template: undefined,
          tokenId: 'session_123',
          tokenRaw: 'invalid.jwt.token',
          traceId: 'test_trace_4',
        },
      } as MessageEvent<SessionTokenEvent>;

      expect(() => {
        broadcastListener(event);
      }).not.toThrow();

      expect(SessionTokenCache.size()).toBe(0);
    });

    it('skips token with missing iat claim', () => {
      const invalidJwtWithoutIat =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      const event: MessageEvent<SessionTokenEvent> = {
        data: {
          organizationId: null,
          sessionId: 'session_123',
          template: undefined,
          tokenId: 'session_123',
          tokenRaw: invalidJwtWithoutIat,
          traceId: 'test_trace_5',
        },
      } as MessageEvent<SessionTokenEvent>;

      broadcastListener(event);

      expect(SessionTokenCache.size()).toBe(0);
    });

    it('skips token with missing exp claim', () => {
      // JWT with iat but no exp: {iat: 1666648250}
      const invalidJwtWithoutExp =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NjY2NDgyNTB9.NjdkMzg4YzYwZTQxZWQ2MTJkNmQ1ZDQ5YzY4ZTQxNjI';
      const event: MessageEvent<SessionTokenEvent> = {
        data: {
          organizationId: null,
          sessionId: 'session_123',
          template: undefined,
          tokenId: 'session_123',
          tokenRaw: invalidJwtWithoutExp,
          traceId: 'test_trace_6',
        },
      } as MessageEvent<SessionTokenEvent>;

      broadcastListener(event);

      expect(SessionTokenCache.size()).toBe(0);
    });

    it('enforces monotonicity: does not overwrite newer token with older one', () => {
      const newerEvent: MessageEvent<SessionTokenEvent> = {
        data: {
          organizationId: null,
          sessionId: 'session_123',
          template: undefined,
          tokenId: 'session_123',
          tokenRaw: mockJwt,
          traceId: 'test_trace_7',
        },
      } as MessageEvent<SessionTokenEvent>;

      broadcastListener(newerEvent);
      const resultAfterNewer = SessionTokenCache.get({ tokenId: 'session_123' });
      expect(resultAfterNewer).toBeDefined();
      const newerCreatedAt = resultAfterNewer?.entry.createdAt;

      // mockJwt has iat: 1666648250, so create an older one with iat: 1666648190 (60 seconds earlier)
      const olderJwt =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NjY2NDg4NTAsImlhdCI6MTY2NjY0ODE5MH0.Z1BC47lImYvaAtluJlY-kBo0qOoAk42Xb-gNrB2SxJg';
      const olderEvent: MessageEvent<SessionTokenEvent> = {
        data: {
          organizationId: null,
          sessionId: 'session_123',
          template: undefined,
          tokenId: 'session_123',
          tokenRaw: olderJwt,
          traceId: 'test_trace_8',
        },
      } as MessageEvent<SessionTokenEvent>;

      broadcastListener(olderEvent);

      const resultAfterOlder = SessionTokenCache.get({ tokenId: 'session_123' });
      expect(resultAfterOlder).toBeDefined();
      expect(resultAfterOlder?.entry.createdAt).toBe(newerCreatedAt);
    });

    it('successfully updates cache with valid token', () => {
      const event: MessageEvent<SessionTokenEvent> = {
        data: {
          organizationId: null,
          sessionId: 'session_123',
          template: undefined,
          tokenId: 'session_123',
          tokenRaw: mockJwt,
          traceId: 'test_trace_9',
        },
      } as MessageEvent<SessionTokenEvent>;

      broadcastListener(event);

      const result = SessionTokenCache.get({ tokenId: 'session_123' });
      expect(result).toBeDefined();
      expect(result?.entry.tokenId).toBe('session_123');
    });

    it('does not re-broadcast when receiving a broadcast message', async () => {
      // Clear any previous postMessage calls from setup
      mockBroadcastChannel.postMessage.mockClear();

      const event: MessageEvent<SessionTokenEvent> = {
        data: {
          organizationId: null,
          sessionId: 'session_123',
          template: undefined,
          tokenId: 'session_123',
          tokenRaw: mockJwt,
          traceId: 'test_trace_10',
        },
      } as MessageEvent<SessionTokenEvent>;

      broadcastListener(event);

      // Flush microtasks to let the tokenResolver promise settle without advancing timers
      await Promise.resolve();

      // Verify cache was updated
      const result = SessionTokenCache.get({ tokenId: 'session_123' });
      expect(result).toBeDefined();

      // Critical: postMessage should NOT be called when handling a broadcast
      expect(mockBroadcastChannel.postMessage).not.toHaveBeenCalled();
    });

    it('always broadcasts regardless of cache state', async () => {
      mockBroadcastChannel.postMessage.mockClear();

      const tokenId = 'sess_2GbDB4enNdCa5vS1zpC3Xzg9tK9';
      const tokenResolver = Promise.resolve(
        new Token({
          id: tokenId,
          jwt: mockJwt,
          object: 'token',
        }) as TokenResource,
      );

      SessionTokenCache.set({ tokenId, tokenResolver });
      await tokenResolver;

      expect(mockBroadcastChannel.postMessage).toHaveBeenCalledTimes(1);
      const firstCall = mockBroadcastChannel.postMessage.mock.calls[0][0];
      expect(firstCall.tokenId).toBe(tokenId);

      mockBroadcastChannel.postMessage.mockClear();

      const tokenResolver2 = Promise.resolve(
        new Token({
          id: tokenId,
          jwt: mockJwt,
          object: 'token',
        }) as TokenResource,
      );

      SessionTokenCache.set({ tokenId, tokenResolver: tokenResolver2 });
      await tokenResolver2;

      expect(mockBroadcastChannel.postMessage).toHaveBeenCalledTimes(1);
    });
  });

  describe('token expiration with absolute time', () => {
    it('returns token when expiresAt is far in the future', async () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const futureJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({ iat: Math.floor(Date.now() / 1000), exp: futureExp }),
      )}.signature`;

      const tokenResolver = Promise.resolve({
        getRawString: () => futureJwt,
        jwt: { claims: { exp: futureExp, iat: Math.floor(Date.now() / 1000) } },
      } as any);

      SessionTokenCache.set({ tokenId: 'future_token', tokenResolver });

      // Wait for promise to resolve
      await tokenResolver;

      const result = SessionTokenCache.get({ tokenId: 'future_token' });
      expect(result).toBeDefined();
      expect(result?.entry.tokenId).toBe('future_token');
    });

    it('removes token when it has already expired based on duration', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const iat = nowSeconds - 120;
      const exp = iat + 60;
      const pastJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ iat, exp }))}.signature`;

      const tokenResolver = Promise.resolve({
        getRawString: () => pastJwt,
        jwt: { claims: { exp, iat } },
      } as any);

      SessionTokenCache.set({ createdAt: nowSeconds - 70, tokenId: 'expired_token', tokenResolver });

      await tokenResolver;

      const result = SessionTokenCache.get({ tokenId: 'expired_token' });
      expect(result).toBeUndefined();
    });

    it('returns token when remaining TTL is above poller interval', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const iat = nowSeconds;
      const exp = iat + 20;
      const soonJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ iat, exp }))}.signature`;

      const tokenResolver = Promise.resolve({
        getRawString: () => soonJwt,
        jwt: { claims: { exp, iat } },
      } as any);

      // Token has 20s TTL, created 11s ago = 9s remaining (> 5s poller interval)
      SessionTokenCache.set({ createdAt: nowSeconds - 11, tokenId: 'soon_expired_token', tokenResolver });

      await tokenResolver;

      // Token is still valid (9s > 5s poller interval), so it should be returned
      const result = SessionTokenCache.get({ tokenId: 'soon_expired_token' });
      expect(result).toBeDefined();
      expect(result?.entry.tokenId).toBe('soon_expired_token');
    });

    it('returns token when expiresAt is undefined (promise not yet resolved)', () => {
      // Create a promise that never resolves
      const pendingTokenResolver = new Promise<any>(() => {});

      SessionTokenCache.set({ tokenId: 'pending_token', tokenResolver: pendingTokenResolver });

      const result = SessionTokenCache.get({ tokenId: 'pending_token' });
      expect(result).toBeDefined();
      expect(result?.entry.tokenId).toBe('pending_token');
    });
  });

  describe('broadcast sending', () => {
    it('broadcasts automatically when token resolves with valid claims', async () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const tokenResolver = Promise.resolve({
        getRawString: () => mockJwt,
        jwt: { claims: { exp: futureExp, iat: 1675876730, sid: 'session_123' } },
      } as any);

      SessionTokenCache.set({
        tokenId: 'session_123',
        tokenResolver,
      });

      // Wait for the token to resolve and broadcast to happen
      await tokenResolver;

      expect(mockBroadcastChannel.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: undefined,
          sessionId: 'session_123',
          template: undefined,
          tokenId: 'session_123',
          tokenRaw: mockJwt,
          traceId: expect.stringMatching(/^bc_\d+_[a-z0-9]+$/),
        }),
      );
    });

    it('does not broadcast when token has no sid claim', async () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const tokenResolver = Promise.resolve({
        getRawString: () => mockJwt,
        jwt: { claims: { exp: futureExp, iat: 1675876730 } },
      } as any);

      SessionTokenCache.set({
        tokenId: 'session_123',
        tokenResolver,
      });

      await tokenResolver;

      expect(mockBroadcastChannel.postMessage).not.toHaveBeenCalled();
    });

    it('validates tokenId matches expected format before broadcasting', async () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const tokenResolver = Promise.resolve({
        getRawString: () => mockJwt,
        jwt: { claims: { exp: futureExp, iat: 1675876730, sid: 'session_123' } },
      } as any);

      SessionTokenCache.set({
        tokenId: 'wrong-token-id',
        tokenResolver,
      });

      await tokenResolver;

      expect(mockBroadcastChannel.postMessage).not.toHaveBeenCalled();
    });
  });

  describe('clear()', () => {
    it('removes all entries and clears timeouts', async () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const futureJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({ data: 'test', exp: futureExp, iat: Math.floor(Date.now() / 1000) }),
      )}.signature`;

      const token = new Token({
        id: 'test-token',
        jwt: futureJwt,
        object: 'token',
      });

      const tokenResolver = Promise.resolve<TokenResource>(token);
      const key = {
        audience: 'test-audience',
        tokenId: 'test-token',
      };

      SessionTokenCache.set({ ...key, tokenResolver });
      await tokenResolver;

      expect(SessionTokenCache.get(key)?.entry).toBeDefined();
      expect(SessionTokenCache.size()).toBe(1);

      SessionTokenCache.clear();

      expect(SessionTokenCache.get(key)).toBeUndefined();
      expect(SessionTokenCache.size()).toBe(0);

      vi.advanceTimersByTime(3600 * 1000);
      expect(SessionTokenCache.size()).toBe(0);
    });
  });

  describe('token lifecycle with async resolution', () => {
    it('caches tokenResolver while pending, after resolved, then auto-deletes on expiration', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const jwt = createJwtWithTtl(nowSeconds, 60);

      const token = new Token({
        id: 'lifecycle-token',
        jwt,
        object: 'token',
      });

      let isResolved = false;
      const tokenResolver = new Promise<TokenResource>(resolve =>
        setTimeout(() => {
          isResolved = true;
          resolve(token);
        }, 100),
      );

      const key = {
        audience: 'lifecycle-test',
        tokenId: 'lifecycle-token',
      };

      expect(SessionTokenCache.get(key)).toBeUndefined();

      SessionTokenCache.set({ ...key, tokenResolver });

      const resultWhilePending = SessionTokenCache.get(key);
      expect(resultWhilePending).toBeDefined();
      expect(resultWhilePending?.entry.tokenId).toBe('lifecycle-token');
      expect(isResolved).toBe(false);

      vi.advanceTimersByTime(100);
      await tokenResolver;

      const resultAfterResolved = SessionTokenCache.get(key);
      expect(isResolved).toBe(true);
      expect(resultAfterResolved).toBeDefined();
      expect(resultAfterResolved?.entry.tokenId).toBe('lifecycle-token');

      vi.advanceTimersByTime(60 * 1000);

      const resultAfterExpiration = SessionTokenCache.get(key);
      expect(resultAfterExpiration).toBeUndefined();
    });
  });

  describe('proactive refresh timer', () => {
    it('calls onRefresh callback when refresh timer fires', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const jwt = createJwtWithTtl(nowSeconds, 60);

      const token = new Token({
        id: 'refresh-timer-token',
        jwt,
        object: 'token',
      });

      const onRefresh = vi.fn();
      const tokenResolver = Promise.resolve<TokenResource>(token);
      const key = { audience: 'refresh-test', tokenId: 'refresh-timer-token' };

      SessionTokenCache.set({ ...key, tokenResolver, onRefresh });
      await tokenResolver;

      // Timer should fire at: 60s - 15s (leeway) - 2s (lead time) = 43s
      expect(onRefresh).not.toHaveBeenCalled();

      // Advance to just before timer should fire
      vi.advanceTimersByTime(42 * 1000);
      expect(onRefresh).not.toHaveBeenCalled();

      // Advance past timer fire time
      vi.advanceTimersByTime(2 * 1000);
      expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    it('does not schedule refresh timer when onRefresh is not provided', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const jwt = createJwtWithTtl(nowSeconds, 60);

      const token = new Token({
        id: 'no-callback-token',
        jwt,
        object: 'token',
      });

      const tokenResolver = Promise.resolve<TokenResource>(token);
      const key = { tokenId: 'no-callback-token' };

      // Set without onRefresh (like broadcast-received tokens)
      SessionTokenCache.set({ ...key, tokenResolver });
      await tokenResolver;

      // Token should still be cached and retrievable
      const result = SessionTokenCache.get(key);
      expect(result?.entry.tokenId).toBe('no-callback-token');

      // Advance past when timer would fire - nothing should happen
      vi.advanceTimersByTime(50 * 1000);

      // Token should still be valid (10s remaining)
      const stillCached = SessionTokenCache.get(key);
      expect(stillCached?.entry.tokenId).toBe('no-callback-token');
    });

    it('clears refresh timer when entry is deleted', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const jwt = createJwtWithTtl(nowSeconds, 60);

      const token = new Token({
        id: 'clear-timer-token',
        jwt,
        object: 'token',
      });

      const onRefresh = vi.fn();
      const tokenResolver = Promise.resolve<TokenResource>(token);
      const key = { tokenId: 'clear-timer-token' };

      SessionTokenCache.set({ ...key, tokenResolver, onRefresh });
      await tokenResolver;

      // Clear the cache before timer fires
      vi.advanceTimersByTime(30 * 1000);
      SessionTokenCache.clear();

      // Advance past when timer would have fired
      vi.advanceTimersByTime(20 * 1000);

      // onRefresh should not have been called since entry was cleared
      expect(onRefresh).not.toHaveBeenCalled();
    });

    it('does not schedule refresh timer for tokens with very short TTL', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      // Token with 10s TTL - refreshFireTime would be 10 - 15 - 2 = -7 (negative)
      const jwt = createJwtWithTtl(nowSeconds, 10);

      const token = new Token({
        id: 'short-ttl-token',
        jwt,
        object: 'token',
      });

      const onRefresh = vi.fn();
      const tokenResolver = Promise.resolve<TokenResource>(token);
      const key = { tokenId: 'short-ttl-token' };

      SessionTokenCache.set({ ...key, tokenResolver, onRefresh });
      await tokenResolver;

      // Advance past token expiration
      vi.advanceTimersByTime(15 * 1000);

      // onRefresh should not have been called - no timer was scheduled
      expect(onRefresh).not.toHaveBeenCalled();
    });

    it('returns token until expiration even after refresh timer fires', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const jwt = createJwtWithTtl(nowSeconds, 60);

      const token = new Token({
        id: 'still-valid-token',
        jwt,
        object: 'token',
      });

      const onRefresh = vi.fn();
      const tokenResolver = Promise.resolve<TokenResource>(token);
      const key = { tokenId: 'still-valid-token' };

      SessionTokenCache.set({ ...key, tokenResolver, onRefresh });
      await tokenResolver;

      // Advance past refresh timer (43s)
      vi.advanceTimersByTime(50 * 1000);
      expect(onRefresh).toHaveBeenCalledTimes(1);

      // Token should still be retrievable (10s remaining, > 5s poller interval)
      const result = SessionTokenCache.get(key);
      expect(result?.entry.tokenId).toBe('still-valid-token');
    });
  });

  describe('hard cutoff behavior', () => {
    it('returns token when TTL is above poller interval', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const jwt = createJwtWithTtl(nowSeconds, 60);

      const token = new Token({
        id: 'above-cutoff-token',
        jwt,
        object: 'token',
      });

      const tokenResolver = Promise.resolve<TokenResource>(token);
      const key = { tokenId: 'above-cutoff-token' };

      SessionTokenCache.set({ ...key, tokenResolver });
      await tokenResolver;

      // 60s remaining
      let result = SessionTokenCache.get(key);
      expect(result?.entry.tokenId).toBe('above-cutoff-token');

      // 10s remaining (above 5s cutoff)
      vi.advanceTimersByTime(50 * 1000);
      result = SessionTokenCache.get(key);
      expect(result?.entry.tokenId).toBe('above-cutoff-token');
    });

    it('forces synchronous refresh when token has less than poller interval remaining', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const jwt = createJwtWithTtl(nowSeconds, 60);

      const token = new Token({
        id: 'hard-cutoff-token',
        jwt,
        object: 'token',
      });

      const tokenResolver = Promise.resolve<TokenResource>(token);
      const key = { tokenId: 'hard-cutoff-token' };

      SessionTokenCache.set({ ...key, tokenResolver });
      await tokenResolver;

      // 6s remaining (just above 5s cutoff)
      vi.advanceTimersByTime(54 * 1000);
      let result = SessionTokenCache.get(key);
      expect(result?.entry.tokenId).toBe('hard-cutoff-token');

      // 4s remaining (below 5s cutoff) - forces sync refresh
      vi.advanceTimersByTime(2 * 1000);
      result = SessionTokenCache.get(key);
      expect(result).toBeUndefined();
    });
  });

  describe('dynamic TTL calculation', () => {
    it('handles tokens with short TTL (30 seconds)', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const jwt = createJwtWithTtl(nowSeconds, 30);

      const token = new Token({
        id: 'short-ttl',
        jwt,
        object: 'token',
      });

      const tokenResolver = Promise.resolve<TokenResource>(token);
      const key = { audience: 'short-ttl-test', tokenId: 'short-ttl' };

      SessionTokenCache.set({ ...key, tokenResolver });
      await tokenResolver;

      expect(SessionTokenCache.get(key)?.entry).toBeDefined();

      vi.advanceTimersByTime(30 * 1000);

      expect(SessionTokenCache.get(key)).toBeUndefined();
    });

    it('handles tokens with long TTL (120 seconds)', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const jwt = createJwtWithTtl(nowSeconds, 120);

      const token = new Token({
        id: 'long-ttl',
        jwt,
        object: 'token',
      });

      const tokenResolver = Promise.resolve<TokenResource>(token);
      const key = { audience: 'long-ttl-test', tokenId: 'long-ttl' };

      SessionTokenCache.set({ ...key, tokenResolver });
      await tokenResolver;

      expect(SessionTokenCache.get(key)?.entry).toBeDefined();

      vi.advanceTimersByTime(90 * 1000);
      expect(SessionTokenCache.get(key)?.entry).toBeDefined();

      vi.advanceTimersByTime(30 * 1000);
      expect(SessionTokenCache.get(key)).toBeUndefined();
    });

    it('handles tokens with various TTLs correctly', async () => {
      const testCases = [
        { label: 'fresh-20s', ttl: 20 },
        { label: 'fresh-45s', ttl: 45 },
        { label: 'fresh-300s', ttl: 300 },
      ];

      for (const { ttl, label } of testCases) {
        const iat = Math.floor(Date.now() / 1000);
        const jwt = createJwtWithTtl(iat, ttl);
        const token = new Token({
          id: label,
          jwt,
          object: 'token',
        });

        const tokenResolver = Promise.resolve<TokenResource>(token);
        SessionTokenCache.set({ tokenId: label, tokenResolver });
        await tokenResolver;

        expect(SessionTokenCache.get({ tokenId: label })?.entry).toBeDefined();

        vi.advanceTimersByTime(ttl * 1000);
        expect(SessionTokenCache.get({ tokenId: label })).toBeUndefined();
      }
    });
  });

  describe('audience parameter support', () => {
    it('caches and retrieves tokens with audience parameter', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const jwt = createJwtWithTtl(nowSeconds, 60);

      const token = new Token({
        id: 'audience-token',
        jwt,
        object: 'token',
      });

      const tokenResolver = Promise.resolve<TokenResource>(token);
      const keyWithAudience = {
        audience: 'https://api.example.com',
        tokenId: 'audience-token',
      };

      SessionTokenCache.set({ ...keyWithAudience, tokenResolver });
      await tokenResolver;

      const result = SessionTokenCache.get(keyWithAudience);
      expect(result).toBeDefined();
      expect(result?.entry.audience).toBe('https://api.example.com');
    });

    it('treats tokens with different audiences as separate entries', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const jwt1 = createJwtWithTtl(nowSeconds, 60);
      const jwt2 = createJwtWithTtl(nowSeconds, 60);

      const token1 = new Token({ id: 'same-id', jwt: jwt1, object: 'token' });
      const token2 = new Token({ id: 'same-id', jwt: jwt2, object: 'token' });

      const resolver1 = Promise.resolve<TokenResource>(token1);
      const resolver2 = Promise.resolve<TokenResource>(token2);

      const key1 = { audience: 'audience-1', tokenId: 'same-id' };
      const key2 = { audience: 'audience-2', tokenId: 'same-id' };

      SessionTokenCache.set({ ...key1, tokenResolver: resolver1 });
      SessionTokenCache.set({ ...key2, tokenResolver: resolver2 });

      await Promise.all([resolver1, resolver2]);

      expect(SessionTokenCache.size()).toBe(2);
      expect(SessionTokenCache.get(key1)?.entry).toBeDefined();
      expect(SessionTokenCache.get(key2)?.entry).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('removes token from cache when tokenResolver promise rejects', async () => {
      const tokenResolver = Promise.reject(new Error('Token fetch failed'));

      const key = { tokenId: 'failing-token' };

      SessionTokenCache.set({ ...key, tokenResolver });

      await expect(tokenResolver).rejects.toThrow('Token fetch failed');

      await vi.waitFor(() => {
        expect(SessionTokenCache.get(key)).toBeUndefined();
      });
    });

    it('handles errors during broadcast token comparison gracefully', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const jwt = createJwtWithTtl(nowSeconds, 60);

      const brokenToken = {
        getRawString: () => {
          throw new Error('Token broken');
        },
        jwt: { claims: { exp: nowSeconds + 60, iat: nowSeconds } },
      } as any;

      const brokenResolver = Promise.resolve(brokenToken);
      SessionTokenCache.set({ tokenId: 'session_123', tokenResolver: brokenResolver });

      await brokenResolver;

      const event: MessageEvent<SessionTokenEvent> = {
        data: {
          organizationId: null,
          sessionId: 'session_123',
          template: undefined,
          tokenId: 'session_123',
          tokenRaw: jwt,
          traceId: 'test_trace_10',
        },
      } as MessageEvent<SessionTokenEvent>;

      expect(() => {
        broadcastListener(event);
      }).not.toThrow();
    });
  });

  describe('resolvedToken', () => {
    it('is populated after tokenResolver resolves', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const jwt = createJwtWithTtl(nowSeconds, 60);

      const token = new Token({
        id: 'resolved-token-test',
        jwt,
        object: 'token',
      });

      const tokenResolver = Promise.resolve<TokenResource>(token);
      const key = { tokenId: 'resolved-token-test' };

      SessionTokenCache.set({ ...key, tokenResolver });

      // Before promise resolves, resolvedToken should be undefined
      let result = SessionTokenCache.get(key);
      expect(result?.entry.resolvedToken).toBeUndefined();

      // Wait for promise to resolve
      await tokenResolver;

      // After promise resolves, resolvedToken should be populated
      result = SessionTokenCache.get(key);
      expect(result?.entry.resolvedToken).toBeDefined();
      expect(result?.entry.resolvedToken?.getRawString()).toBeTruthy();
    });

    it('can be provided when setting a pre-resolved token', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const jwt = createJwtWithTtl(nowSeconds, 60);

      const token = new Token({
        id: 'pre-resolved-token',
        jwt,
        object: 'token',
      });

      const key = { tokenId: 'pre-resolved-token' };

      // Set with both tokenResolver and resolvedToken
      SessionTokenCache.set({
        ...key,
        resolvedToken: token,
        tokenResolver: Promise.resolve(token),
      });

      // resolvedToken should be immediately available
      const result = SessionTokenCache.get(key);
      expect(result?.entry.resolvedToken).toBeDefined();
      expect(result?.entry.resolvedToken).toBe(token);
    });
  });

  describe('multi-session isolation', () => {
    it('stores tokens from different session IDs separately without interference', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const session1Id = 'sess_user1_abc123';
      const session2Id = 'sess_user2_xyz789';

      const session1Jwt = createJwtWithTtl(nowSeconds, 60);
      const session1Token = new Token({
        id: session1Id,
        jwt: session1Jwt,
        object: 'token',
      });
      const session1Resolver = Promise.resolve(session1Token as TokenResource);

      SessionTokenCache.set({
        audience: undefined,
        createdAt: nowSeconds,
        tokenId: session1Id,
        tokenResolver: session1Resolver,
      });

      await session1Resolver;

      expect(SessionTokenCache.get({ tokenId: session1Id })).toBeDefined();
      const initialSize = SessionTokenCache.size();
      expect(initialSize).toBe(1);

      const session2Jwt = createJwtWithTtl(nowSeconds, 60);
      const broadcastEvent: MessageEvent<SessionTokenEvent> = {
        data: {
          organizationId: null,
          sessionId: session2Id,
          template: undefined,
          tokenId: session2Id,
          tokenRaw: session2Jwt,
          traceId: 'test_trace_multisession',
        },
      } as MessageEvent<SessionTokenEvent>;

      broadcastListener(broadcastEvent);

      await vi.waitFor(() => {
        expect(SessionTokenCache.get({ tokenId: session2Id })).toBeDefined();
      });

      expect(SessionTokenCache.size()).toBe(2);

      // Critical: Verify that requesting session1's token still returns session1's token
      // (not session2's token) - tokens are isolated by tokenId
      const retrievedSession1Token = SessionTokenCache.get({ tokenId: session1Id });
      expect(retrievedSession1Token).toBeDefined();
      const resolvedSession1Token = await retrievedSession1Token!.entry.tokenResolver;
      expect(resolvedSession1Token.jwt?.claims?.iat).toBe(nowSeconds);
      expect(retrievedSession1Token!.entry.tokenId).toBe(session1Id);

      // Verify session2's token is separate
      const retrievedSession2Token = SessionTokenCache.get({ tokenId: session2Id });
      expect(retrievedSession2Token).toBeDefined();
      expect(retrievedSession2Token!.entry.tokenId).toBe(session2Id);
      expect(retrievedSession2Token!.entry.tokenId).not.toBe(session1Id);
    });

    it('accepts broadcast messages from the same session ID', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const sessionId = 'sess_same_user';

      const initialJwt = createJwtWithTtl(nowSeconds - 10, 60);
      const initialToken = new Token({
        id: sessionId,
        jwt: initialJwt,
        object: 'token',
      });
      const initialResolver = Promise.resolve(initialToken as TokenResource);

      SessionTokenCache.set({
        audience: undefined,
        createdAt: nowSeconds - 10,
        tokenId: sessionId,
        tokenResolver: initialResolver,
      });

      await initialResolver;

      const cachedToken = SessionTokenCache.get({ tokenId: sessionId });
      expect(cachedToken).toBeDefined();
      const resolvedToken = await cachedToken!.entry.tokenResolver;
      expect(resolvedToken.jwt?.claims?.iat).toBe(nowSeconds - 10);

      const newerJwt = createJwtWithTtl(nowSeconds, 60);
      const broadcastEvent: MessageEvent<SessionTokenEvent> = {
        data: {
          organizationId: null,
          sessionId: sessionId,
          template: undefined,
          tokenId: sessionId,
          tokenRaw: newerJwt,
          traceId: 'test_trace_same_session',
        },
      } as MessageEvent<SessionTokenEvent>;

      broadcastListener(broadcastEvent);

      await vi.waitFor(async () => {
        const updatedCached = SessionTokenCache.get({ tokenId: sessionId });
        expect(updatedCached).toBeDefined();
        const updatedToken = await updatedCached!.entry.tokenResolver;
        expect(updatedToken.jwt?.claims?.iat).toBe(nowSeconds);
      });

      expect(SessionTokenCache.size()).toBe(1);
    });
  });
});
