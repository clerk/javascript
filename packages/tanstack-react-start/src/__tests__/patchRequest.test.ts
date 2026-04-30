import { describe, expect, it } from 'vitest';

import { patchRequest } from '../server/utils';

describe('patchRequest', () => {
  it('preserves the URL including path and query string', () => {
    const original = new Request('https://example.com/path?token=xyz&foo=bar');
    const cloned = patchRequest(original);
    expect(cloned.url).toBe(original.url);
  });

  it('preserves an encoded nested redirect_url with its own query and port', () => {
    // Mirrors the shape reported in the TanStack + Lovable handshake bug:
    // the outer URL's `redirect_url` param is a percent-encoded inner URL with
    // a port and its own query string, which must survive the clone verbatim.
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

  it('forwards signal aborts from the original request', () => {
    const controller = new AbortController();
    const original = new Request('https://example.com/', { signal: controller.signal });
    const cloned = patchRequest(original);
    expect(cloned.signal.aborted).toBe(false);
    controller.abort();
    expect(cloned.signal.aborted).toBe(true);
  });

  it('clones POST requests without forwarding the body', () => {
    // patchRequest deliberately omits `body` from the cloned init (see #7020)
    // so the original request's body stays intact for downstream consumers and
    // the undici duplex issues the helper was written to avoid do not resurface.
    const original = new Request('https://example.com/api', {
      method: 'POST',
      body: 'payload',
      headers: { 'content-type': 'text/plain' },
    });
    const cloned = patchRequest(original);
    expect(cloned.method).toBe('POST');
    expect(cloned.body).toBeNull();
  });
});
