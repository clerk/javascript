import { constants } from '@clerk/backend';
import { NextRequest } from 'next/server';

import { NextRequestAdapter } from '../utils';

describe('utils', () => {
  it('NextRequestAdapter', () => {
    const req = new NextRequest(new URL('https://example.com?__query=true'), {
      headers: {
        ['cookie']: `__session=tokenSession; expires=Mon, 27 june 2022 12:00:00 UTC;__client_uat=tokenClientUat; expires=Mon, 27 june 2022 12:00:00 UTC;`,
        ['authorization']: 'Bearer tokenValue',
        ['x-forwarded-port']: 'forwarded-port',
        ['x-forwarded-host']: 'forwarded-host',
        ['x-forwarded-proto']: 'forwarded-proto',
        host: 'host',
        referer: 'referer',
        'user-agent': 'user-agent',
        origin: 'origin',
      },
    });

    const reqAdapter = new NextRequestAdapter(req);

    expect(reqAdapter.cookies(constants.Cookies.Session)).toBe('tokenSession');
    expect(reqAdapter.cookies(constants.Cookies.ClientUat)).toBe('tokenClientUat');
    expect(reqAdapter.headers(constants.Headers.Authorization)).toBe('Bearer tokenValue');
    expect(reqAdapter.headers(constants.Headers.ForwardedPort)).toBe('forwarded-port');
    expect(reqAdapter.headers(constants.Headers.ForwardedHost)).toBe('forwarded-host');
    expect(reqAdapter.headers(constants.Headers.ForwardedProto)).toBe('forwarded-proto');
    expect(reqAdapter.headers(constants.Headers.Host)).toBe('host');
    expect(reqAdapter.headers(constants.Headers.Referrer)).toBe('referer');
    expect(reqAdapter.headers(constants.Headers.UserAgent)).toBe('user-agent');
    expect(reqAdapter.headers(constants.Headers.Origin)).toBe('origin');
    expect(reqAdapter.searchParams().get('__query')).toBe('true');
  });
});
