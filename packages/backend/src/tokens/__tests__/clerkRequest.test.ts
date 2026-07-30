import { describe, expect, it } from 'vitest';

import { createClerkRequest } from '../clerkRequest';

// Some test runtimes (e.g. Cloudflare/miniflare) gate `new ReadableStream()`
// behind a feature flag and throw when it is constructed directly.
const supportsStreamConstruction = (() => {
  try {
    new ReadableStream({
      start(controller) {
        controller.close();
      },
    });
    return true;
  } catch {
    return false;
  }
})();

describe('createClerkRequest', () => {
  describe('instantiating a request', () => {
    it('retains the headers', () => {
      const oldReq = new Request('http://localhost:3000', { headers: new Headers({ a: '1', b: '2' }) });
      const req = createClerkRequest(oldReq);
      expect(req.headers.get('a')).toBe(oldReq.headers.get('a'));
      expect(req.headers.get('b')).toBe(oldReq.headers.get('b'));
    });

    it('retains the method', () => {
      const oldReq = new Request('http://localhost:3000', { method: 'POST' });
      const req = createClerkRequest(oldReq);
      expect(req.method).toBe(oldReq.method);
    });

    // The hazard only exists on undici-style runtimes (Node, edge) where the
    // request body is a single-use stream. Cloudflare/miniflare buffers bodies
    // (so the body survives anyway) and cannot construct a streaming body, so
    // this regression is skipped there.
    it.skipIf(!supportsStreamConstruction)('does not consume the original request body (issue #8305)', async () => {
      // Clerk only needs the method, headers, cookies, and URL. Forwarding the
      // body made the clone share the original's single-use stream, so reading
      // either side left the other "unusable" for downstream handlers (e.g. a
      // Hono POST route calling `c.req.json()`).
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(JSON.stringify({ a: '1' })));
          controller.close();
        },
      });
      const oldReq = new Request('http://localhost:3000', {
        method: 'POST',
        body: stream,
        // `duplex` is required when streaming a body; not yet in all lib typings.
        duplex: 'half',
      } as RequestInit);

      const req = createClerkRequest(oldReq);

      // The clone carries no body, so it can never lock the original's stream...
      expect(req.body).toBeNull();
      // ...and the original stream stays readable for downstream consumers.
      expect(((await oldReq.json()) as { a: string }).a).toBe('1');
    });

    it('retains the url', () => {
      const oldReq = new Request('http://localhost:3000');
      const req = createClerkRequest(oldReq);
      expect(req.url).toBe(oldReq.url);
    });

    it('retains the referrer', () => {
      const oldReq = new Request('http://localhost:3000', { referrer: 'http://localhost:3000' });
      const req = createClerkRequest(oldReq);
      expect(req.referrer).toBe(oldReq.referrer);
    });

    it('retains the referrerPolicy', () => {
      const oldReq = new Request('http://localhost:3000', { referrerPolicy: 'no-referrer' });
      const req = createClerkRequest(oldReq);
      expect(req.referrerPolicy).toBe(oldReq.referrerPolicy);
    });
  });

  describe('cookies', () => {
    it('should parse and return cookies', () => {
      const req = createClerkRequest(
        new Request('http://localhost:3000', { headers: new Headers({ cookie: 'foo=bar' }) }),
      );
      expect(req.cookies.get('foo')).toBe('bar');
    });

    it('should parse and return cookies with special characters', () => {
      const req = createClerkRequest(
        new Request('http://localhost:3000', { headers: new Headers({ cookie: 'foo=%20bar%3B%20baz%3Dqux' }) }),
      );
      expect(req.cookies.get('foo')).toBe('bar');
      expect(req.cookies.get('baz')).toBe('qux');
    });

    it('should parse and return cookies even if no cookie header exists', () => {
      const req = createClerkRequest(new Request('http://localhost:3000', { headers: new Headers() }));
      expect(req.cookies.get('foo')).toBeUndefined();
    });

    it('should parse and return cookies even if cookie header is empty', () => {
      const req = createClerkRequest(new Request('http://localhost:3000', { headers: new Headers({ cookie: '' }) }));
      expect(req.cookies.get('foo')).toBeUndefined();
    });
  });

  describe('clerkUrl', () => {
    it('should return a clerkUrl', () => {
      const req = createClerkRequest(new Request('http://localhost:3000'));
      expect(req.clerkUrl.href).toBe('http://localhost:3000/');
    });

    it('without headers', () => {
      const req = new Request('http://localhost:3000/path');
      expect(createClerkRequest(req).clerkUrl.toString()).toBe('http://localhost:3000/path');
    });

    it('with forwarded proto / host headers', () => {
      const req = new Request('http://localhost:3000/path', {
        headers: { 'x-forwarded-host': 'example.com', 'x-forwarded-proto': 'https,http' },
      });
      expect(createClerkRequest(req).clerkUrl.toString()).toBe('https://example.com/path');
    });

    it('with forwarded proto / host and host headers', () => {
      const req = new Request('http://localhost:3000/path', {
        headers: {
          'x-forwarded-host': 'example.com',
          'x-forwarded-proto': 'https,http',
          host: 'example-host.com',
        },
      });
      expect(createClerkRequest(req).clerkUrl.toString()).toBe('https://example.com/path');
    });

    it('with path in request', () => {
      const req = new Request('http://localhost:3000/path');
      expect(createClerkRequest(req).clerkUrl.toString()).toBe('http://localhost:3000/path');
    });

    it('with query params in request', () => {
      const req = new Request('http://localhost:3000/path?foo=bar');
      expect(createClerkRequest(req).clerkUrl.toString()).toBe('http://localhost:3000/path?foo=bar');
    });

    it('with forwarded host (behind a proxy)', () => {
      const req = new Request('http://localhost:3000/path?foo=bar', {
        headers: new Headers({ 'x-forwarded-host': 'example.com' }),
      });
      expect(createClerkRequest(req).clerkUrl.toString()).toBe('http://example.com/path?foo=bar');
    });

    it('with forwarded host - with multiple values', () => {
      const req = new Request('http://localhost:3000/path?foo=bar', {
        headers: { 'x-forwarded-host': 'example.com,example-2.com' },
      });
      expect(createClerkRequest(req).clerkUrl.toString()).toBe('http://example.com/path?foo=bar');
    });

    it('with forwarded proto and host', () => {
      const req = new Request('http://localhost:3000/path?foo=bar', {
        headers: { 'x-forwarded-host': 'example.com', 'x-forwarded-proto': 'https' },
      });
      expect(createClerkRequest(req).clerkUrl.toString()).toBe('https://example.com/path?foo=bar');
    });

    it('with forwarded proto and host - without protocol', () => {
      const req = new Request('http://localhost:3000/path?foo=bar', {
        headers: { 'x-forwarded-host': 'example.com', 'x-forwarded-proto': 'https' },
      });
      expect(createClerkRequest(req).clerkUrl.toString()).toBe('https://example.com/path?foo=bar');
    });

    it('with forwarded proto and host - without host', () => {
      const req = new Request('http://localhost:3000/path?foo=bar', {
        headers: { 'x-forwarded-host': 'example.com', 'x-forwarded-proto': 'https' },
      });
      expect(createClerkRequest(req).clerkUrl.toString()).toBe('https://example.com/path?foo=bar');
    });

    it('with forwarded proto and host - without host and protocol', () => {
      const req = new Request('http://localhost:3000/path?foo=bar', {
        headers: { 'x-forwarded-host': 'example.com', 'x-forwarded-proto': 'https' },
      });
      expect(createClerkRequest(req).clerkUrl.toString()).toBe('https://example.com/path?foo=bar');
    });

    it('with duplicate leading slashes in URL path', () => {
      const req1 = new Request('http://localhost:3000//path');
      expect(createClerkRequest(req1).clerkUrl.toString()).toBe('http://localhost:3000//path');

      const req2 = new Request('http://localhost:3000////path');
      expect(createClerkRequest(req2).clerkUrl.toString()).toBe('http://localhost:3000////path');
    });

    it('handles malicious host header with script injection gracefully', () => {
      const req = new Request('http://localhost:3000/path', {
        headers: {
          'x-forwarded-host': 'z2cgvm.xfh"></script><script>alert(document.domain);</script>/',
          'x-forwarded-proto': 'https',
        },
      });
      expect(() => createClerkRequest(req)).not.toThrow();
      expect(createClerkRequest(req).clerkUrl.toString()).toBe('http://localhost:3000/path');
    });

    it('handles malicious host header with invalid characters gracefully', () => {
      const req = new Request('http://localhost:3000/path?foo=bar', {
        headers: {
          'x-forwarded-host': '<invalid>host',
          'x-forwarded-proto': 'https',
        },
      });
      expect(() => createClerkRequest(req)).not.toThrow();
      expect(createClerkRequest(req).clerkUrl.toString()).toBe('http://localhost:3000/path?foo=bar');
    });

    it('handles empty forwarded headers gracefully', () => {
      const req = new Request('http://localhost:3000/path', {
        headers: {
          'x-forwarded-host': '',
          'x-forwarded-proto': '',
        },
      });
      expect(() => createClerkRequest(req)).not.toThrow();
      expect(createClerkRequest(req).clerkUrl.toString()).toBe('http://localhost:3000/path');
    });
  });

  describe('toJSON', () => {
    it('returns data as a JSON object', () => {
      const req = createClerkRequest(new Request('http://localhost:3000'));
      const json = req.toJSON();
      expect(json.url).toBe('http://localhost:3000/');
      expect(json.method).toBe('GET');
      expect(json.headers).toBe('{}');
      expect(json.clerkUrl).toBe('http://localhost:3000/');
      expect(json.cookies).toBe('{}');
    });
  });

  describe('duck typing detection (instanceof workaround)', () => {
    it('should create a new ClerkRequest from a regular Request', () => {
      const regularRequest = new Request('http://localhost:3000');
      const clerkRequest = createClerkRequest(regularRequest);

      expect(clerkRequest).not.toBe(regularRequest);
      expect(clerkRequest.clerkUrl).toBeDefined();
      expect(clerkRequest.cookies).toBeDefined();
    });

    it('should return an existing ClerkRequest instance unchanged', () => {
      const firstClerkRequest = createClerkRequest(new Request('http://localhost:3000'));
      const secondClerkRequest = createClerkRequest(firstClerkRequest);

      expect(secondClerkRequest).toBe(firstClerkRequest);
    });

    it('should work correctly with bundler-scoped Request classes', () => {
      // Simulate bundler creating a scoped Request class (like Request$1)
      class RequestScoped extends Request {
        constructor(input: RequestInfo | URL, init?: RequestInit) {
          super(input, init);
        }
      }

      const scopedRequest = new RequestScoped('http://localhost:3000');
      const clerkRequest = createClerkRequest(scopedRequest);

      // Should create a new ClerkRequest even though scopedRequest is a different Request class
      expect(clerkRequest).not.toBe(scopedRequest);
      expect(clerkRequest.clerkUrl).toBeDefined();
      expect(clerkRequest.cookies).toBeDefined();
    });
  });
});
