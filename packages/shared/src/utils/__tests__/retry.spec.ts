import { describe, expect, it } from 'vitest';

import { getRetryAfterMs } from '../retry';

describe('api.retry', () => {
  it('parses retry-after values correctly', () => {
    expect(getRetryAfterMs(new Headers({ 'Retry-After': '120' }))).toBe(120000);
    expect(getRetryAfterMs(new Headers({ 'Retry-After': '0' }))).toBe(0);
    expect(getRetryAfterMs(new Headers({ 'Retry-After': '   45   ' }))).toBe(45000);
    expect(
      getRetryAfterMs(new Headers({ 'Retry-After': new Date(new Date().getTime() + 60000).toUTCString() })),
    ).toBeGreaterThan(0);
    expect(getRetryAfterMs(new Headers({ 'Retry-After': 'Wed, 21 Oct 2000 07:28:00 GMT' }))).toBe(0); // past date
    expect(getRetryAfterMs(new Headers({ 'Retry-After': 'invalid-date' }))).toBeUndefined();
    expect(getRetryAfterMs(new Headers({}))).toBeUndefined();
    expect(getRetryAfterMs(new Headers({ 'Retry-After': '60, 120' }))).toBe(60000); // multiple headers, use first
  });
});
