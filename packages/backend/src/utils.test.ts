import type QUnit from 'qunit';

import { buildOrigin, type BuildOriginOptions, buildRequestUrl } from './utils';

const fwdOpts: BuildOriginOptions = { hostPreference: 'forwarded' };

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  module('buildOrigin({ protocol, forwardedProto, forwardedHost, host }, { hostPreference: "default" })', () => {
    test('without any param', assert => {
      assert.equal(buildOrigin({}), '');
    });

    test('with protocol', assert => {
      assert.equal(buildOrigin({ protocol: 'http' }), '');
    });

    test('with host', assert => {
      assert.equal(buildOrigin({ host: 'localhost:3000' }), '');
    });

    test('with protocol and host', assert => {
      assert.equal(buildOrigin({ protocol: 'http', host: 'localhost:3000' }), 'http://localhost:3000');
    });

    test('with forwarded proto', assert => {
      assert.equal(
        buildOrigin({ protocol: 'http', host: 'example-host.com', forwardedProto: 'https' }),
        'https://example-host.com',
      );
    });

    test('with forwarded proto - with multiple values', assert => {
      assert.equal(
        buildOrigin({ protocol: 'http', host: 'example-host.com', forwardedProto: 'https,http' }),
        'https://example-host.com',
      );
    });

    test('with forwarded host', assert => {
      assert.equal(
        buildOrigin({ protocol: 'http', host: 'example-host.com', forwardedHost: 'example.com' }),
        'http://example-host.com',
      );
    });

    test('with forwarded host - with multiple values', assert => {
      assert.equal(
        buildOrigin({ protocol: 'http', host: 'example-host.com', forwardedHost: 'example.com,example-2.com' }),
        'http://example-host.com',
      );
    });

    test('with forwarded proto and host', assert => {
      assert.equal(
        buildOrigin({
          protocol: 'http',
          host: 'example-host.com',
          forwardedProto: 'https',
          forwardedHost: 'example.com',
        }),
        'https://example-host.com',
      );
    });

    test('with forwarded proto and host - without protocol', assert => {
      assert.equal(
        buildOrigin({ host: 'example-host.com', forwardedProto: 'https', forwardedHost: 'example.com' }),
        'https://example-host.com',
      );
    });

    test('with forwarded proto and host - without host', assert => {
      assert.equal(
        buildOrigin({ protocol: 'http', forwardedProto: 'https', forwardedHost: 'example.com' }),
        'https://example.com',
      );
    });

    test('with forwarded proto and host - without host and protocol', assert => {
      assert.equal(buildOrigin({ forwardedProto: 'https', forwardedHost: 'example.com' }), 'https://example.com');
    });
  });

  module('buildOrigin({ protocol, forwardedProto, forwardedHost, host }, { hostPreference: "forwarded" })', () => {
    test('without any param', assert => {
      assert.equal(buildOrigin({}, fwdOpts), '');
    });

    test('with protocol', assert => {
      assert.equal(buildOrigin({ protocol: 'http' }, fwdOpts), '');
    });

    test('with host', assert => {
      assert.equal(buildOrigin({ host: 'localhost:3000' }, fwdOpts), '');
    });

    test('with protocol and host', assert => {
      assert.equal(buildOrigin({ protocol: 'http', host: 'localhost:3000' }, fwdOpts), 'http://localhost:3000');
    });

    test('with forwarded proto', assert => {
      assert.equal(
        buildOrigin({ protocol: 'http', host: 'localhost:3000', forwardedProto: 'https' }, fwdOpts),
        'https://localhost:3000',
      );
    });

    test('with forwarded proto - with multiple values', assert => {
      assert.equal(
        buildOrigin({ protocol: 'http', host: 'localhost:3000', forwardedProto: 'https,http' }, fwdOpts),
        'https://localhost:3000',
      );
    });

    test('with forwarded host', assert => {
      assert.equal(
        buildOrigin({ protocol: 'http', host: 'localhost:3000', forwardedHost: 'example.com' }, fwdOpts),
        'http://example.com',
      );
    });

    test('with forwarded host - with multiple values', assert => {
      assert.equal(
        buildOrigin({ protocol: 'http', host: 'localhost:3000', forwardedHost: 'example.com,example-2.com' }, fwdOpts),
        'http://example.com',
      );
    });

    test('with forwarded proto and host', assert => {
      assert.equal(
        buildOrigin(
          {
            protocol: 'http',
            host: 'localhost:3000',
            forwardedProto: 'https',
            forwardedHost: 'example.com',
          },
          fwdOpts,
        ),
        'https://example.com',
      );
    });

    test('with forwarded proto and host - without protocol', assert => {
      assert.equal(
        buildOrigin({ host: 'localhost:3000', forwardedProto: 'https', forwardedHost: 'example.com' }, fwdOpts),
        'https://example.com',
      );
    });

    test('with forwarded proto and host - without host', assert => {
      assert.equal(
        buildOrigin({ protocol: 'http', forwardedProto: 'https', forwardedHost: 'example.com' }, fwdOpts),
        'https://example.com',
      );
    });

    test('with forwarded proto and host - without host and protocol', assert => {
      assert.equal(
        buildOrigin({ forwardedProto: 'https', forwardedHost: 'example.com' }, fwdOpts),
        'https://example.com',
      );
    });
  });

  module('buildRequestUrl({ request, path })', () => {
    test('without headers', assert => {
      const req = new Request('http://localhost:3000/path');
      assert.equal(buildRequestUrl(req), 'http://localhost:3000/path');
    });

    test('with forwarded proto / host headers', assert => {
      const req = new Request('http://localhost:3000/path', {
        headers: { 'x-forwarded-host': 'example.com', 'x-forwarded-proto': 'https,http', host: 'example-host.com' },
      });
      assert.equal(buildRequestUrl(req), 'https://example-host.com/path');
    });

    test('with forwarded proto / host and host headers', assert => {
      const req = new Request('http://localhost:3000/path', {
        headers: {
          'x-forwarded-host': 'example.com',
          'x-forwarded-proto': 'https,http',
          host: 'example-host.com',
        },
      });
      assert.equal(buildRequestUrl(req), 'https://example-host.com/path');
    });

    test('with path', assert => {
      const req = new Request('http://localhost:3000/path');
      assert.equal(buildRequestUrl(req, '/other-path'), 'http://localhost:3000/other-path');
    });

    test('with query params in request', assert => {
      const req = new Request('http://localhost:3000/path');
      assert.equal(buildRequestUrl(req), 'http://localhost:3000/path');
    });
  });

  module('buildRequestUrl({ request, path }, { hostPreference: "forwarded" })', () => {
    test('without headers', assert => {
      const req = new Request('http://localhost:3000/path');
      assert.equal(buildRequestUrl(req, fwdOpts), 'http://localhost:3000/path');
    });

    test('with forwarded proto / host headers', assert => {
      const req = new Request('http://localhost:3000/path', {
        headers: { 'x-forwarded-host': 'example.com', 'x-forwarded-proto': 'https,http' },
      });
      assert.equal(buildRequestUrl(req, fwdOpts), 'https://example.com/path');
    });

    test('with forwarded proto / host and host headers', assert => {
      const req = new Request('http://localhost:3000/path', {
        headers: {
          'x-forwarded-host': 'example.com',
          'x-forwarded-proto': 'https,http',
          host: 'example-host.com',
        },
      });
      assert.equal(buildRequestUrl(req, fwdOpts), 'https://example.com/path');
    });

    test('with path', assert => {
      const req = new Request('http://localhost:3000/path');
      assert.equal(buildRequestUrl(req, '/other-path', fwdOpts), 'http://localhost:3000/other-path');
    });

    test('with query params in request', assert => {
      const req = new Request('http://localhost:3000/path');
      assert.equal(buildRequestUrl(req, fwdOpts), 'http://localhost:3000/path');
    });
  });
};
