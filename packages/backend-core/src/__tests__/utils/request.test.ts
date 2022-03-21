import { checkCrossOrigin } from '../../util/request';

describe('check cross-origin-referrer request utility', () => {
  test('is not CO with IPv6', () => {
    const originURL = new URL('http://[::1]');
    const host = new URL('http://[::1]').host;
    expect(checkCrossOrigin({ originURL, host })).toEqual(false);
  });

  test('is not CO with set https and 443 port', () => {
    const originURL = new URL('https://localhost:443');
    const host = new URL('https://localhost').host;
    expect(checkCrossOrigin({ originURL, host })).toEqual(false);
  });

  test('is CO with mixed default security ports', () => {
    const originURL = new URL('https://localhost:80');
    const host = new URL('http://localhost:443').host;
    expect(checkCrossOrigin({ originURL, host })).toEqual(true);
  });

  test.todo('we cannot detect if the request is CO when HTTPS to HTTP and no other information is carried over');

  test('is CO when HTTPS to HTTP with present x-forwarded-proto', () => {
    const originURL = new URL('https://localhost');
    const host = new URL('http://someserver').host;
    const forwardedHost = new URL('http://localhost').host;
    const forwardedProto = 'http';
    expect(
      checkCrossOrigin({
        originURL,
        host,
        forwardedHost,
        forwardedProto,
      }),
    ).toEqual(true);
  });

  test('is CO when HTTPS to HTTP with forwarded port', () => {
    const originURL = new URL('https://localhost');
    const host = new URL('http://localhost').host;
    const forwardedPort = '80';
    expect(checkCrossOrigin({ originURL, host, forwardedPort })).toEqual(true);
  });

  test('is CO with cross origin auth domain', () => {
    const originURL = new URL('https://accounts.clerk.dev');
    const host = new URL('https://localhost').host;
    expect(checkCrossOrigin({ originURL, host })).toEqual(true);
  });

  test('is CO when forwarded port overrides host derived port', () => {
    const originURL = new URL('https://localhost:443');
    const host = new URL('https://localhost').host;
    const forwardedPort = '3001';
    expect(checkCrossOrigin({ originURL, host, forwardedPort })).toEqual(true);
  });

  test('is not CO with port included in x-forwarded host', () => {
    /* Example https://www.rfc-editor.org/rfc/rfc7239#section-4 */
    const originURL = new URL('http://localhost:3000');
    const host = '127.0.0.1:3000';
    const forwardedHost = 'localhost:3000';
    expect(
      checkCrossOrigin({
        originURL,
        host,
        forwardedHost,
      }),
    ).toEqual(false);
  });

  test('is CO with port included in x-forwarded host', () => {
    /* Example https://www.rfc-editor.org/rfc/rfc7239#section-4 */
    const originURL = new URL('http://localhost:3000');
    const host = '127.0.0.1:3000';
    const forwardedHost = 'localhost:4000';
    expect(
      checkCrossOrigin({
        originURL,
        host,
        forwardedHost,
      }),
    ).toEqual(true);
  });
});
