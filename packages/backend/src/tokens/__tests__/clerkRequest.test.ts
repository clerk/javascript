import { describe, expect, it } from 'vitest';

import { createClerkRequest } from '../clerkRequest';

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

    it('retains the body', async () => {
      const data = { a: '1' };
      const oldReq = new Request('http://localhost:3000', { method: 'POST', body: JSON.stringify(data) });
      const req = createClerkRequest(oldReq);
      expect((await req.json())['a']).toBe(data.a);
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

    it('should handle malformed x-forwarded-host header gracefully', () => {
      const req = new Request('http://localhost:3000/path', {
        headers: {
          'x-forwarded-host': 'z2cgvm.xfh"></script><script>alert(document.domain);</script>',
          'x-forwarded-proto': 'https',
        },
      });
      // Should fall back to original URL instead of throwing
      expect(createClerkRequest(req).clerkUrl.toString()).toBe('http://localhost:3000/path');
    });

    it('should handle malformed host header gracefully', () => {
      const req = new Request('http://localhost:3000/path', {
        headers: {
          host: 'z2cgvm.xfh"></script><script>alert(document.domain);</script>',
        },
      });
      // Should fall back to original URL instead of throwing
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
});
