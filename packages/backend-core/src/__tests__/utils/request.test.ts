import { checkCrossOriginReferrer } from '../../util/request';

describe('check cross-origin-referrer request utility', () => {
  test('is not CO with IPv6', () => {
    const referrerURL = new URL('http://[::1]');
    const host = new URL('http://[::1]').host;
    expect(checkCrossOriginReferrer({ referrerURL, host })).toEqual(false);
  });

  test('is not CO with set https and 443 port', () => {
    const referrerURL = new URL('https://localhost:443');
    const host = new URL('https://localhost').host;
    expect(checkCrossOriginReferrer({ referrerURL, host })).toEqual(false);
  });

  test('is CO with mixed default security ports', () => {
    const referrerURL = new URL('https://localhost:80');
    const host = new URL('http://localhost:443').host;
    expect(checkCrossOriginReferrer({ referrerURL, host })).toEqual(true);
  });

  test.skip('is CO when HTTPS to HTTP', () => {
    const referrerURL = new URL('https://localhost');
    const host = new URL('http://localhost').host;
    expect(checkCrossOriginReferrer({ referrerURL, host })).toEqual(true);
  });

  test('is CO when HTTPS to HTTP with forwarded port', () => {
    const referrerURL = new URL('https://localhost');
    const host = new URL('http://localhost').host;
    const forwardedPort = '80';
    expect(
      checkCrossOriginReferrer({ referrerURL, host, forwardedPort }),
    ).toEqual(true);
  });

  test('is CO with cross origin auth domain', () => {
    const referrerURL = new URL('https://accounts.clerk.dev');
    const host = new URL('https://localhost').host;
    expect(checkCrossOriginReferrer({ referrerURL, host })).toEqual(true);
  });

  test('is CO when forwarded port overrides host derived port', () => {
    const referrerURL = new URL('https://localhost:443');
    const host = new URL('https://localhost').host;
    const forwardedPort = '3001';
    expect(
      checkCrossOriginReferrer({ referrerURL, host, forwardedPort }),
    ).toEqual(true);
  });

  test('is not CO with port included in x-forwarded host', () => {
    /* Example https://www.rfc-editor.org/rfc/rfc7239#section-4 */
    const referrerURL = new URL('http://localhost:3000');
    const host = '127.0.0.1:3000';
    const forwardedHost = 'localhost:3000';
    expect(
      checkCrossOriginReferrer({
        referrerURL,
        host,
        forwardedHost,
      }),
    ).toEqual(false);
  });

  test('is CO with port included in x-forwarded host', () => {
    /* Example https://www.rfc-editor.org/rfc/rfc7239#section-4 */
    const referrerURL = new URL('http://localhost:3000');
    const host = '127.0.0.1:3000';
    const forwardedHost = 'localhost:4000';
    expect(
      checkCrossOriginReferrer({
        referrerURL,
        host,
        forwardedHost,
      }),
    ).toEqual(true);
  });
});
