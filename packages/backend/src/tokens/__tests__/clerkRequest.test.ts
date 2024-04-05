import { createClerkRequest } from '../clerkRequest';

export default (QUnit: QUnit) => {
  const { module, test: it } = QUnit;

  module('createClerkRequest', () => {
    module('instantiating a request', () => {
      it('retains the headers', assert => {
        const oldReq = new Request('http://localhost:3000', { headers: new Headers({ a: '1', b: '2' }) });
        const req = createClerkRequest(oldReq);
        assert.equal(req.headers.get('a'), oldReq.headers.get('a'));
        assert.equal(req.headers.get('b'), oldReq.headers.get('b'));
      });

      it('retains the method', assert => {
        const oldReq = new Request('http://localhost:3000', { method: 'POST' });
        const req = createClerkRequest(oldReq);
        assert.equal(req.method, oldReq.method);
      });

      it('retains the body', async assert => {
        const data = { a: '1' };
        const oldReq = new Request('http://localhost:3000', { method: 'POST', body: JSON.stringify(data) });
        const req = createClerkRequest(oldReq);
        assert.equal((await req.json())['a'], data.a);
      });
    });

    module('cookies', () => {
      it('should parse and return cookies', assert => {
        const req = createClerkRequest(
          new Request('http://localhost:3000', { headers: new Headers({ cookie: 'foo=bar' }) }),
        );
        assert.equal(req.cookies.get('foo'), 'bar');
      });

      it('should parse and return cookies with special characters', assert => {
        const req = createClerkRequest(
          new Request('http://localhost:3000', { headers: new Headers({ cookie: 'foo=%20bar%3B%20baz%3Dqux' }) }),
        );
        assert.equal(req.cookies.get('foo'), 'bar');
        assert.equal(req.cookies.get('baz'), 'qux');
      });

      it('should parse and return cookies even if no cookie header exists', assert => {
        const req = createClerkRequest(new Request('http://localhost:3000', { headers: new Headers() }));
        assert.equal(req.cookies.get('foo'), undefined);
      });

      it('should parse and return cookies even if cookie header is empty', assert => {
        const req = createClerkRequest(new Request('http://localhost:3000', { headers: new Headers({ cookie: '' }) }));
        assert.equal(req.cookies.get('foo'), undefined);
      });
    });

    module('clerkUrl', () => {
      it('should return a clerkUrl', assert => {
        const req = createClerkRequest(new Request('http://localhost:3000'));
        assert.equal(req.clerkUrl.href, 'http://localhost:3000/');
      });

      it('without headers', assert => {
        const req = new Request('http://localhost:3000/path');
        assert.equal(createClerkRequest(req).clerkUrl.toString(), 'http://localhost:3000/path');
      });

      it('with forwarded proto / host headers', assert => {
        const req = new Request('http://localhost:3000/path', {
          headers: { 'x-forwarded-host': 'example.com', 'x-forwarded-proto': 'https,http' },
        });
        assert.equal(createClerkRequest(req).clerkUrl.toString(), 'https://example.com/path');
      });

      it('with forwarded proto / host and host headers', assert => {
        const req = new Request('http://localhost:3000/path', {
          headers: {
            'x-forwarded-host': 'example.com',
            'x-forwarded-proto': 'https,http',
            host: 'example-host.com',
          },
        });
        assert.equal(createClerkRequest(req).clerkUrl.toString(), 'https://example.com/path');
      });

      it('with path in request', assert => {
        const req = new Request('http://localhost:3000/path');
        assert.equal(createClerkRequest(req).clerkUrl.toString(), 'http://localhost:3000/path');
      });

      it('with query params in request', assert => {
        const req = new Request('http://localhost:3000/path?foo=bar');
        assert.equal(createClerkRequest(req).clerkUrl.toString(), 'http://localhost:3000/path?foo=bar');
      });

      it('with forwarded host (behind a proxy)', assert => {
        const req = new Request('http://localhost:3000/path?foo=bar', {
          headers: new Headers({ 'x-forwarded-host': 'example.com' }),
        });
        assert.equal(createClerkRequest(req).clerkUrl.toString(), 'http://example.com/path?foo=bar');
      });

      it('with forwarded host - with multiple values', assert => {
        const req = new Request('http://localhost:3000/path?foo=bar', {
          headers: { 'x-forwarded-host': 'example.com,example-2.com' },
        });
        assert.equal(createClerkRequest(req).clerkUrl.toString(), 'http://example.com/path?foo=bar');
      });

      it('with forwarded proto and host', assert => {
        const req = new Request('http://localhost:3000/path?foo=bar', {
          headers: { 'x-forwarded-host': 'example.com', 'x-forwarded-proto': 'https' },
        });
        assert.equal(createClerkRequest(req).clerkUrl.toString(), 'https://example.com/path?foo=bar');
      });

      it('with forwarded proto and host - without protocol', assert => {
        const req = new Request('http://localhost:3000/path?foo=bar', {
          headers: { 'x-forwarded-host': 'example.com', 'x-forwarded-proto': 'https' },
        });
        assert.equal(createClerkRequest(req).clerkUrl.toString(), 'https://example.com/path?foo=bar');
      });

      it('with forwarded proto and host - without host', assert => {
        const req = new Request('http://localhost:3000/path?foo=bar', {
          headers: { 'x-forwarded-host': 'example.com', 'x-forwarded-proto': 'https' },
        });
        assert.equal(createClerkRequest(req).clerkUrl.toString(), 'https://example.com/path?foo=bar');
      });

      it('with forwarded proto and host - without host and protocol', assert => {
        const req = new Request('http://localhost:3000/path?foo=bar', {
          headers: { 'x-forwarded-host': 'example.com', 'x-forwarded-proto': 'https' },
        });
        assert.equal(createClerkRequest(req).clerkUrl.toString(), 'https://example.com/path?foo=bar');
      });
    });
  });
};
