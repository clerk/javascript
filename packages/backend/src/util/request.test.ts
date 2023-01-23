import type QUnit from 'qunit';

import { checkCrossOrigin } from './request';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  module('check cross-origin-referrer request utility', () => {
    test('is not CO with IPv6', async assert => {
      const originURL = new URL('http://[::1]');
      const host = new URL('http://[::1]').host;
      assert.false(checkCrossOrigin({ originURL, host }));
    });

    test('is not CO with set https and 443 port', async assert => {
      const originURL = new URL('https://localhost:443');
      const host = new URL('https://localhost').host;
      assert.false(checkCrossOrigin({ originURL, host }));
    });

    test('is CO with mixed default security ports', async assert => {
      const originURL = new URL('https://localhost:80');
      const host = new URL('http://localhost:443').host;
      assert.true(checkCrossOrigin({ originURL, host }));
    });

    // todo(
    //   'we cannot detect if the request is CO when HTTPS to HTTP and no other information is carried over',
    //   async assert => {
    //     assert.true(true);
    //   },
    // );

    test('is CO when HTTPS to HTTP with present x-forwarded-proto', async assert => {
      const originURL = new URL('https://localhost');
      const host = new URL('http://someserver').host;
      const forwardedHost = new URL('http://localhost').host;
      const forwardedProto = 'http';

      assert.true(checkCrossOrigin({ originURL, host, forwardedHost, forwardedProto }));
    });

    test('is CO when HTTPS to HTTP with forwarded port', async assert => {
      const originURL = new URL('https://localhost');
      const host = new URL('http://localhost').host;
      const forwardedPort = '80';

      assert.true(checkCrossOrigin({ originURL, host, forwardedPort }));
    });

    test('is CO with cross origin auth domain', async assert => {
      const originURL = new URL('https://accounts.clerk.dev');
      const host = new URL('https://localhost').host;
      assert.true(checkCrossOrigin({ originURL, host }));
    });

    test('is CO when forwarded port overrides host derived port', async assert => {
      const originURL = new URL('https://localhost:443');
      const host = new URL('https://localhost').host;
      const forwardedPort = '3001';
      assert.true(checkCrossOrigin({ originURL, host, forwardedPort }));
    });

    test('is not CO with port included in x-forwarded host', async assert => {
      /* Example https://www.rfc-editor.org/rfc/rfc7239#section-4 */
      const originURL = new URL('http://localhost:3000');
      const host = '127.0.0.1:3000';
      const forwardedHost = 'localhost:3000';
      assert.false(checkCrossOrigin({ originURL, host, forwardedHost }));
    });

    test('is CO with port included in x-forwarded host', async assert => {
      /* Example https://www.rfc-editor.org/rfc/rfc7239#section-4 */
      const originURL = new URL('http://localhost:3000');
      const host = '127.0.0.1:3000';
      const forwardedHost = 'localhost:4000';
      assert.true(checkCrossOrigin({ originURL, host, forwardedHost }));
    });
  });
};
