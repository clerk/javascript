import type QUnit from 'qunit';

import { checkCrossOrigin } from '../request';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  module('check cross-origin-referrer request utility', () => {
    test('is not CO with IPv6', assert => {
      const originURL = new URL('http://[::1]');
      const host = new URL('http://[::1]').host;
      assert.false(checkCrossOrigin({ originURL, host }));
    });

    test('is not CO with set https and 443 port', assert => {
      const originURL = new URL('https://localhost:443');
      const host = new URL('https://localhost').host;
      assert.false(checkCrossOrigin({ originURL, host }));
    });

    test('is CO with mixed default security ports', assert => {
      const originURL = new URL('https://localhost:80');
      const host = new URL('http://localhost:443').host;
      assert.true(checkCrossOrigin({ originURL, host }));
    });

    // todo(
    //   'we cannot detect if the request is CO when HTTPS to HTTP and no other information is carried over',
    //   assert => {
    //     assert.true(true);
    //   },
    // );

    test('is CO when HTTPS to HTTP with present x-forwarded-proto', assert => {
      const originURL = new URL('https://localhost');
      const host = new URL('http://someserver').host;
      const forwardedHost = new URL('http://localhost').host;
      const forwardedProto = 'http';

      assert.true(checkCrossOrigin({ originURL, host, forwardedHost, forwardedProto }));
    });

    test('is CO when HTTPS to HTTP with forwarded proto', assert => {
      const originURL = new URL('https://localhost');
      const host = new URL('http://localhost').host;
      const forwardedProto = 'http';

      assert.true(checkCrossOrigin({ originURL, host, forwardedProto }));
    });

    test('is CO with cross origin auth domain', assert => {
      const originURL = new URL('https://accounts.clerk.com');
      const host = new URL('https://localhost').host;
      assert.true(checkCrossOrigin({ originURL, host }));
    });

    test('is CO when forwarded port overrides host derived port', assert => {
      const originURL = new URL('https://localhost:443');
      const host = new URL('https://localhost:3001').host;
      assert.true(checkCrossOrigin({ originURL, host }));
    });

    test('is not CO with port included in x-forwarded host', assert => {
      /* Example https://www.rfc-editor.org/rfc/rfc7239#section-4 */
      const originURL = new URL('http://localhost:3000');
      const host = '127.0.0.1:3000';
      const forwardedHost = 'localhost:3000';
      assert.false(checkCrossOrigin({ originURL, host, forwardedHost }));
    });

    test('is CO with port included in x-forwarded host', assert => {
      /* Example https://www.rfc-editor.org/rfc/rfc7239#section-4 */
      const originURL = new URL('http://localhost:3000');
      const host = '127.0.0.1:3000';
      const forwardedHost = 'localhost:4000';
      assert.true(checkCrossOrigin({ originURL, host, forwardedHost }));
    });

    test('is not CO when forwarded port and origin does not contain a port - http', assert => {
      const originURL = new URL('http://localhost');
      const host = new URL('http://localhost').host;

      assert.false(checkCrossOrigin({ originURL, host }));
    });

    test('is not CO when forwarded port and origin does not contain a port - https', assert => {
      const originURL = new URL('https://localhost');
      const host = new URL('https://localhost').host;

      assert.false(checkCrossOrigin({ originURL, host }));
    });

    test('is not CO based on referrer with forwarded host & port and referer', assert => {
      const host = '';
      const forwardedHost = 'example.com';
      const referrer = 'http://example.com/';

      assert.false(checkCrossOrigin({ originURL: new URL(referrer), host, forwardedHost }));
    });

    test('is not CO for AWS Amplify', assert => {
      const options = {
        originURL: new URL('https://main.d38v5rl8fqcx2i.amplifyapp.com'),
        host: 'prod.eu-central-1.gateway.amplify.aws.dev',
        forwardedPort: '443,80',
        forwardedHost: 'main.d38v5rl8fqcx2i.amplifyapp.com',
        forwardedProto: 'https,http',
      };
      assert.false(checkCrossOrigin(options));
    });

    test('is not CO for Railway App', assert => {
      const options = {
        originURL: new URL('https://aws-clerk-nextjs-production.up.railway.app'),
        host: 'aws-clerk-nextjs-production.up.railway.app',
        forwardedPort: '80',
        forwardedHost: 'aws-clerk-nextjs-production.up.railway.app',
        forwardedProto: 'https,http',
      };
      assert.false(checkCrossOrigin(options));
    });

    test('is not CO for localhost application running in non http port', assert => {
      const options = {
        originURL: new URL('http://localhost:4011/protected'),
        host: 'localhost:4011',
        forwardedHost: 'localhost:4011',
        forwardedPort: '4011',
        forwardedProto: 'http',
      };

      assert.false(checkCrossOrigin(options));
    });
  });
};
