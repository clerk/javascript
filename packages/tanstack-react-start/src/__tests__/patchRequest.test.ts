import { describe, expect, it } from 'vitest';

import { patchRequest } from '../server/utils';

describe('patchRequest', () => {
  it('preserves the URL including path and query string', () => {
    const original = new Request('https://example.com/path?token=xyz&foo=bar');
    const cloned = patchRequest(original);
    expect(cloned.url).toBe('https://example.com/path?token=xyz&foo=bar');
  });

  it('preserves x-forwarded-* headers', () => {
    const original = new Request('https://example.com/', {
      headers: { 'x-forwarded-host': 'example.com', 'x-forwarded-proto': 'https' },
    });
    const cloned = patchRequest(original);
    expect(cloned.headers.get('x-forwarded-host')).toBe('example.com');
    expect(cloned.headers.get('x-forwarded-proto')).toBe('https');
  });

  it('preserves the method', () => {
    const original = new Request('https://example.com/', { method: 'POST' });
    const cloned = patchRequest(original);
    expect(cloned.method).toBe('POST');
  });

  it('returns a new Request instance', () => {
    const original = new Request('https://example.com/');
    const cloned = patchRequest(original);
    expect(cloned).not.toBe(original);
    expect(cloned).toBeInstanceOf(Request);
  });
});
