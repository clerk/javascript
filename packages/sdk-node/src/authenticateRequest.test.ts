import { constants } from '@clerk/backend';
import type { Request } from 'express';

import { authenticateRequest } from './authenticateRequest';
import { NodeRequestAdapter } from './utils';

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
    expect(clerkClient.authenticateRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        authorizedParties: ['party1'],
        apiKey: apiKey,
        secretKey: secretKey,
        frontendApi: frontendApi,
        publishableKey: publishableKey,
        jwtKey: 'jwtKey',
        isSatellite: false,
        proxyUrl: undefined,
        signInUrl: '',
        domain: '',
        requestAdapter: expect.any(NodeRequestAdapter),
      }),
    );
  });
});
