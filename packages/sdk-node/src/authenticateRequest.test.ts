import { constants } from '@clerk/backend';
import type { Request } from 'express';

import { authenticateRequest } from './authenticateRequest';

const mockNext = jest.fn();

afterEach(() => {
  mockNext.mockReset();
});

const mockClerkClient = () => ({
  authenticateRequest: jest.fn(),
});

describe('authenticateRequest', () => {
  it('correctly parses the req object', async () => {
    const req = {
      headers: {
        ['cookie']: `${constants.Cookies.Session}=token; expires=Mon, 27 june 2022 12:00:00 UTC;${constants.Cookies.ClientUat}=token;${constants.Cookies.SessionUat}=token; expires=Mon, 27 june 2022 12:00:00 UTC;`,
        [constants.Headers.Authorization]: 'Bearer token',
        [constants.Headers.ForwardedPort]: 'port',
        [constants.Headers.ForwardedHost]: 'host',
        host: 'host',
        referer: 'referer',
        'user-agent': 'user-agent',
      },
      url: '/whatever?__query=true',
    } as any as Request;

    const options = {
      jwtKey: 'jwtKey',
      authorizedParties: ['party1'],
    };

    const clerkClient = mockClerkClient();
    const apiKey = 'apiKey';
    const secretKey = '';
    const frontendApi = 'frontendApi';
    const publishableKey = 'publishableKey';
    const searchParams = new URLSearchParams();
    searchParams.set('__query', 'true');

    await authenticateRequest({
      clerkClient: clerkClient as any,
      apiKey,
      secretKey,
      frontendApi,
      publishableKey,
      req,
      options,
    });
    expect(clerkClient.authenticateRequest).toHaveBeenCalledWith({
      authorizedParties: ['party1'],
      clientUat: 'token',
      sessionUat: 'token',
      cookieToken: 'token',
      forwardedHost: 'host',
      forwardedPort: 'port',
      apiKey: apiKey,
      secretKey: secretKey,
      frontendApi: frontendApi,
      publishableKey: publishableKey,
      headerToken: 'token',
      host: 'host',
      jwtKey: 'jwtKey',
      referrer: 'referer',
      userAgent: 'user-agent',
      isSatellite: false,
      proxyUrl: '',
      signInUrl: '',
      domain: '',
      searchParams,
    });
  });
});
