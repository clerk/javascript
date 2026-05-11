import { afterEach, describe, expect, it, vi } from 'vitest';

import { checkOAuthTokenRateLimit, resetOAuthTokenRateLimiter } from '../oauthTokenRateLimiter';

afterEach(() => {
  resetOAuthTokenRateLimiter();
  vi.useRealTimers();
});

describe('checkOAuthTokenRateLimit', () => {
  it('allows the first request from an IP', () => {
    expect(checkOAuthTokenRateLimit('1.2.3.4')).toBe(true);
  });

  it('allows up to MAX_BURST requests in a burst', () => {
    const ip = '10.0.0.1';
    for (let i = 0; i < 20; i++) {
      expect(checkOAuthTokenRateLimit(ip), `request ${i + 1} should be allowed`).toBe(true);
    }
  });

  it('blocks requests that exceed MAX_BURST', () => {
    const ip = '10.0.0.2';
    for (let i = 0; i < 20; i++) {
      checkOAuthTokenRateLimit(ip);
    }
    expect(checkOAuthTokenRateLimit(ip)).toBe(false);
  });

  it('allows requests again after tokens refill', () => {
    vi.useFakeTimers();
    const ip = '10.0.0.3';
    for (let i = 0; i < 20; i++) {
      checkOAuthTokenRateLimit(ip);
    }
    expect(checkOAuthTokenRateLimit(ip)).toBe(false);

    // Advance 2 seconds: at 10 tokens/s, 20 new tokens should be available
    vi.advanceTimersByTime(2000);
    expect(checkOAuthTokenRateLimit(ip)).toBe(true);
  });

  it('tracks different IPs independently', () => {
    const ipA = '192.168.1.1';
    const ipB = '192.168.1.2';
    for (let i = 0; i < 20; i++) {
      checkOAuthTokenRateLimit(ipA);
    }
    expect(checkOAuthTokenRateLimit(ipA)).toBe(false);
    expect(checkOAuthTokenRateLimit(ipB)).toBe(true);
  });

  it('treats the unknown sentinel as a single IP', () => {
    for (let i = 0; i < 20; i++) {
      checkOAuthTokenRateLimit('unknown');
    }
    expect(checkOAuthTokenRateLimit('unknown')).toBe(false);
  });

  it('evicts the oldest bucket and allows a new IP when MAX_BUCKETS is reached', () => {
    // Fill up to MAX_BUCKETS (10 000) unique IPs
    for (let i = 0; i < 10_000; i++) {
      checkOAuthTokenRateLimit(`10.${Math.floor(i / 65536)}.${Math.floor((i % 65536) / 256)}.${i % 256}`);
    }
    // The 10 001st IP triggers eviction of the oldest entry; the new IP gets a fresh bucket
    const freshIp = '172.16.0.1';
    expect(checkOAuthTokenRateLimit(freshIp)).toBe(true);
  });

  it('allows a previously blocked IP after resetOAuthTokenRateLimiter', () => {
    const ip = '5.5.5.5';
    for (let i = 0; i < 21; i++) {
      checkOAuthTokenRateLimit(ip);
    }
    expect(checkOAuthTokenRateLimit(ip)).toBe(false);
    resetOAuthTokenRateLimiter();
    expect(checkOAuthTokenRateLimit(ip)).toBe(true);
  });
});
