import { afterEach, describe, expect, it, vi } from 'vitest';

import { checkMachineTokenRateLimit, resetMachineTokenRateLimiter } from '../machineTokenRateLimiter';

afterEach(() => {
  resetMachineTokenRateLimiter();
  vi.useRealTimers();
});

describe('checkMachineTokenRateLimit', () => {
  it('allows the first request from an IP', () => {
    expect(checkMachineTokenRateLimit('1.2.3.4')).toBe(true);
  });

  it('allows up to MAX_BURST requests in a burst', () => {
    const ip = '10.0.0.1';
    for (let i = 0; i < 20; i++) {
      expect(checkMachineTokenRateLimit(ip), `request ${i + 1} should be allowed`).toBe(true);
    }
  });

  it('blocks requests that exceed MAX_BURST', () => {
    const ip = '10.0.0.2';
    for (let i = 0; i < 20; i++) {
      checkMachineTokenRateLimit(ip);
    }
    expect(checkMachineTokenRateLimit(ip)).toBe(false);
  });

  it('allows requests again after tokens refill', () => {
    vi.useFakeTimers();
    const ip = '10.0.0.3';
    for (let i = 0; i < 20; i++) {
      checkMachineTokenRateLimit(ip);
    }
    expect(checkMachineTokenRateLimit(ip)).toBe(false);

    // Advance 2 seconds: at 10 tokens/s, 20 new tokens should be available
    vi.advanceTimersByTime(2000);
    expect(checkMachineTokenRateLimit(ip)).toBe(true);
  });

  it('tracks different IPs independently', () => {
    const ipA = '192.168.1.1';
    const ipB = '192.168.1.2';
    for (let i = 0; i < 20; i++) {
      checkMachineTokenRateLimit(ipA);
    }
    expect(checkMachineTokenRateLimit(ipA)).toBe(false);
    expect(checkMachineTokenRateLimit(ipB)).toBe(true);
  });

  it('treats the unknown sentinel as a single IP', () => {
    for (let i = 0; i < 20; i++) {
      checkMachineTokenRateLimit('unknown');
    }
    expect(checkMachineTokenRateLimit('unknown')).toBe(false);
  });

  it('evicts the oldest bucket and allows a new IP when MAX_BUCKETS is reached', () => {
    // Fill up to MAX_BUCKETS (10 000) unique IPs
    for (let i = 0; i < 10_000; i++) {
      checkMachineTokenRateLimit(`10.${Math.floor(i / 65536)}.${Math.floor((i % 65536) / 256)}.${i % 256}`);
    }
    // The 10 001st IP triggers eviction of the oldest entry; the new IP gets a fresh bucket
    const freshIp = '172.16.0.1';
    expect(checkMachineTokenRateLimit(freshIp)).toBe(true);
  });

  it('allows a previously blocked IP after resetMachineTokenRateLimiter', () => {
    const ip = '5.5.5.5';
    for (let i = 0; i < 21; i++) {
      checkMachineTokenRateLimit(ip);
    }
    expect(checkMachineTokenRateLimit(ip)).toBe(false);
    resetMachineTokenRateLimiter();
    expect(checkMachineTokenRateLimit(ip)).toBe(true);
  });
});
