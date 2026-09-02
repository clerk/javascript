import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { mockJwks, mockJwt, mockJwtPayload } from '../../fixtures';
import { server } from '../../mock-server';
import { AuthErrorReason, AuthStatus } from '../authStatus';
import { HandshakeService } from '../handshake';
import { authenticateRequest } from '../request';
import type { AuthenticateRequestOptions } from '../types';

const PK_TEST = 'pk_test_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA';
const PK_LIVE = 'pk_live_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA';

const navigationHeaders = { host: 'example.com', 'user-agent': 'Mozilla/TestAgent', 'sec-fetch-dest': 'document' };
const fetchHeaders = {
  host: 'example.com',
  'user-agent': 'Mozilla/TestAgent',
  'sec-fetch-dest': 'empty',
  accept: '*/*',
};

const requestWith = (
  headers: Record<string, string>,
  cookies: Record<string, string> = {},
  { method = 'GET', url = 'http://example.com/api/me' } = {},
) => {
  const cookie = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join(';');
  return new Request(url, { method, headers: { ...headers, cookie } });
};

const buildOptions = (overrides: Partial<AuthenticateRequestOptions> = {}) => {
  const getHandshakePayload = vi.fn().mockResolvedValue({ directives: [`__session=${mockJwt}; Path=/`] });
  const options = {
    secretKey: 'live_deadbeef',
    apiUrl: 'https://api.clerk.test',
    apiVersion: 'v1',
    publishableKey: PK_LIVE,
    proxyUrl: '',
    skipJwksCache: true,
    isSatellite: false,
    signInUrl: '',
    signUpUrl: '',
    afterSignInUrl: '',
    afterSignUpUrl: '',
    domain: '',
    apiClient: { clients: { getHandshakePayload } },
    ...overrides,
  } as unknown as AuthenticateRequestOptions;
  return { options, getHandshakePayload };
};

describe('authenticateRequest with __internal_resolveHandshakeOnlyForNavigation: true', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(mockJwtPayload.iat * 1000));
    server.use(http.get('https://api.clerk.test/v1/jwks', () => HttpResponse.json(mockJwks)));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test('fetch request with a stale nonce cookie skips the payload exchange and authenticates from the session cookie', async () => {
    const { options, getHandshakePayload } = buildOptions({ __internal_resolveHandshakeOnlyForNavigation: true });

    const state = await authenticateRequest(
      requestWith(fetchHeaders, { __clerk_handshake_nonce: 'stale', __client_uat: '12345', __session: mockJwt }),
      options,
    );

    expect(getHandshakePayload).not.toHaveBeenCalled();
    expect(state.status).toBe(AuthStatus.SignedIn);
    expect(state.headers.get('location')).toBeNull();
  });

  test('POST request with a stale nonce cookie skips the payload exchange', async () => {
    const { options, getHandshakePayload } = buildOptions({ __internal_resolveHandshakeOnlyForNavigation: true });

    const state = await authenticateRequest(
      requestWith(
        navigationHeaders,
        { __clerk_handshake_nonce: 'stale', __client_uat: '12345', __session: mockJwt },
        { method: 'POST' },
      ),
      options,
    );

    expect(getHandshakePayload).not.toHaveBeenCalled();
    expect(state.status).toBe(AuthStatus.SignedIn);
  });

  test('fetch request with a stale nonce cookie and no session is signed out without a payload exchange', async () => {
    const { options, getHandshakePayload } = buildOptions({ __internal_resolveHandshakeOnlyForNavigation: true });

    const state = await authenticateRequest(
      requestWith(fetchHeaders, { __clerk_handshake_nonce: 'stale', __client_uat: '12345' }),
      options,
    );

    expect(getHandshakePayload).not.toHaveBeenCalled();
    expect(state.status).toBe(AuthStatus.SignedOut);
    expect(state.reason).toBe(AuthErrorReason.ClientUATWithoutSessionToken);
    expect(state.headers.get('location')).toBeNull();
  });

  test('navigation request with a nonce cookie still exchanges the payload', async () => {
    const { options, getHandshakePayload } = buildOptions({ __internal_resolveHandshakeOnlyForNavigation: true });

    const state = await authenticateRequest(
      requestWith(navigationHeaders, { __clerk_handshake_nonce: 'fresh', __client_uat: '12345' }),
      options,
    );

    expect(getHandshakePayload).toHaveBeenCalledTimes(1);
    expect(getHandshakePayload).toHaveBeenCalledWith({ nonce: 'fresh' });
    expect(state.status).toBe(AuthStatus.SignedIn);
  });

  test('by default a fetch request with a nonce cookie still exchanges the payload', async () => {
    const { options, getHandshakePayload } = buildOptions();

    const state = await authenticateRequest(
      requestWith(fetchHeaders, { __clerk_handshake_nonce: 'fresh', __client_uat: '12345' }),
      options,
    );

    expect(getHandshakePayload).toHaveBeenCalledTimes(1);
    expect(state.status).toBe(AuthStatus.SignedIn);
  });

  test('development instance still redirects a navigation request to the dev browser handshake', async () => {
    const { options, getHandshakePayload } = buildOptions({
      __internal_resolveHandshakeOnlyForNavigation: true,
      publishableKey: PK_TEST,
      secretKey: 'test_deadbeef',
    });

    const state = await authenticateRequest(requestWith(navigationHeaders), options);

    expect(getHandshakePayload).not.toHaveBeenCalled();
    expect(state.status).toBe(AuthStatus.Handshake);
    expect(state.reason).toBe(AuthErrorReason.DevBrowserMissing);
    expect(state.headers.get('location')).toContain('/v1/client/handshake');
  });

  test('development navigation request returning from the handshake still resolves the nonce', async () => {
    const { options, getHandshakePayload } = buildOptions({
      __internal_resolveHandshakeOnlyForNavigation: true,
      publishableKey: PK_TEST,
      secretKey: 'test_deadbeef',
    });

    const state = await authenticateRequest(
      requestWith(navigationHeaders, { __clerk_handshake_nonce: 'fresh' }),
      options,
    );

    expect(getHandshakePayload).toHaveBeenCalledTimes(1);
    expect(state.status).toBe(AuthStatus.SignedIn);
  });

  test('stale cookie-transport handshake token on a fetch request is ignored without logging', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { options } = buildOptions({ __internal_resolveHandshakeOnlyForNavigation: true });

    const state = await authenticateRequest(
      requestWith(fetchHeaders, { __clerk_handshake: 'not-a-jwt', __client_uat: '12345', __session: mockJwt }),
      options,
    );

    expect(errorSpy).not.toHaveBeenCalled();
    expect(state.status).toBe(AuthStatus.SignedIn);
  });

  test.each([
    ['omitted', {}],
    ['explicitly false', { __internal_resolveHandshakeOnlyForNavigation: false }],
  ])('when the option is %s the eligibility check is never consulted and the payload is exchanged', async (_, flag) => {
    const eligibilitySpy = vi.spyOn(HandshakeService.prototype, 'isRequestEligibleForHandshake');
    const { options, getHandshakePayload } = buildOptions(flag);

    await authenticateRequest(
      requestWith(fetchHeaders, { __clerk_handshake_nonce: 'fresh', __client_uat: '12345' }),
      options,
    );

    expect(eligibilitySpy).not.toHaveBeenCalled();
    expect(getHandshakePayload).toHaveBeenCalledTimes(1);
  });

  test('only an explicit true consults the eligibility check', async () => {
    const eligibilitySpy = vi.spyOn(HandshakeService.prototype, 'isRequestEligibleForHandshake');
    const { options, getHandshakePayload } = buildOptions({ __internal_resolveHandshakeOnlyForNavigation: true });

    await authenticateRequest(
      requestWith(fetchHeaders, { __clerk_handshake_nonce: 'fresh', __client_uat: '12345' }),
      options,
    );

    expect(eligibilitySpy).toHaveBeenCalled();
    expect(getHandshakePayload).not.toHaveBeenCalled();
  });

  test('by default a stale cookie-transport handshake token on a fetch request logs a resolution error', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { options } = buildOptions();

    const state = await authenticateRequest(
      requestWith(fetchHeaders, { __clerk_handshake: 'not-a-jwt', __client_uat: '12345', __session: mockJwt }),
      options,
    );

    expect(errorSpy).toHaveBeenCalledWith('Clerk: unable to resolve handshake:', expect.anything());
    expect(state.status).toBe(AuthStatus.SignedIn);
  });
});
