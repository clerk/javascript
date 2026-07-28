import { describe, expect, it } from 'vitest';

import { patchRequest } from '../patchRequest';

describe('patchRequest', () => {
  it('preserves the URL including path and query string', () => {
    const original = new Request('https://example.com/path?token=xyz&foo=bar');
    const cloned = patchRequest(original);
    expect(cloned.url).toBe(original.url);
  });

  it('preserves an encoded nested redirect_url with its own query and port', () => {
    const nested = 'https://localhost:8080/?token=abc';
    const original = new Request(`https://example.com/handshake?redirect_url=${encodeURIComponent(nested)}`);
    const cloned = patchRequest(original);
    expect(cloned.url).toBe(original.url);
    expect(new URL(cloned.url).searchParams.get('redirect_url')).toBe(nested);
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

  it('preserves redirect and cache', () => {
    const original = new Request('https://example.com/', {
      redirect: 'manual',
      cache: 'no-cache',
    });
    const cloned = patchRequest(original);
    expect(cloned.redirect).toBe('manual');
    expect(cloned.cache).toBe('no-cache');
  });

  it('clones POST requests without forwarding the body', () => {
    const original = new Request('https://example.com/api', {
      method: 'POST',
      body: 'payload',
      headers: { 'content-type': 'text/plain' },
    });
    const cloned = patchRequest(original);
    expect(cloned.method).toBe('POST');
    expect(cloned.body).toBeNull();
    expect(original.bodyUsed).toBe(false);
  });
});
