import { constants } from '@clerk/backend';
import { Request } from 'express';

import { authenticateRequest } from '../authenticateRequest';

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
        ['cookie']: `${constants.Cookies.Session}=token; expires=Mon, 27 june 2022 12:00:00 UTC;${constants.Cookies.ClientUat}=token; expires=Mon, 27 june 2022 12:00:00 UTC;`,
        [constants.Headers.Authorization]: 'Bearer token',
        [constants.Headers.ForwardedPort]: 'port',
        [constants.Headers.ForwardedHost]: 'host',
        host: 'host',
        referer: 'referer',
        'user-agent': 'user-agent',
      },
      url: 'https://example.com/whatever?__query=true',
    } as any as Request;

    const options = {
      jwtKey: 'jwtKey',
      authorizedParties: ['party1'],
    };

    const clerkClient = mockClerkClient();
    const secretKey = 'secretKey';
    const publishableKey = 'publishableKey';
    const searchParams = new URLSearchParams();
    searchParams.set('__query', 'true');

    await authenticateRequest({
      clerkClient: clerkClient as any,
      secretKey,
      publishableKey,
      req,
      options,
    });

    expect(clerkClient.authenticateRequest).toHaveBeenCalledWith(
      expect.any(Request),
      expect.objectContaining({
        secretKey: secretKey,
        publishableKey: publishableKey,
        jwtKey: 'jwtKey',
        isSatellite: false,
        proxyUrl: '',
        signInUrl: '',
        domain: '',
      }),
    );
  });
});
