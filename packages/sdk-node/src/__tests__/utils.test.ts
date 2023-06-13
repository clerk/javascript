import { constants } from '@clerk/backend';
import type { Request } from 'express';

import { NodeRequestAdapter } from '../utils';

describe('NodeRequestAdapter', () => {
  it('returns the correct headers, cookies and searchParams', () => {
    const req = {
      headers: {
        ['cookie']: `__session=tokenSession; expires=Mon, 27 june 2022 12:00:00 UTC;__client_uat=tokenClientUat; expires=Mon, 27 june 2022 12:00:00 UTC;`,
        ['authorization']: 'Bearer tokenValue',
        ['x-forwarded-port']: 'forwarded-port',
        ['x-forwarded-host']: 'forwarded-host',
        host: 'host',
        referer: 'referer',
        'user-agent': 'user-agent',
      },
      url: '/whatever?__query=true',
    } as any as Request;

    const requestAdapter = new NodeRequestAdapter(req);

    expect(requestAdapter.headers(constants.Headers.Authorization)).toEqual('Bearer tokenValue');
    expect(requestAdapter.headers(constants.Headers.ForwardedPort)).toEqual('forwarded-port');
    expect(requestAdapter.headers(constants.Headers.ForwardedHost)).toEqual('forwarded-host');
    expect(requestAdapter.headers(constants.Headers.Host)).toEqual('host');
    expect(requestAdapter.headers(constants.Headers.Referrer)).toEqual('referer');
    expect(requestAdapter.headers(constants.Headers.UserAgent)).toEqual('user-agent');
    expect(requestAdapter.cookies(constants.Cookies.Session)).toEqual('tokenSession');
    expect(requestAdapter.cookies(constants.Cookies.ClientUat)).toEqual('tokenClientUat');
    expect(requestAdapter.searchParams().toString()).toEqual('__query=true');
  });
});
