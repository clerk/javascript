import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Clerk } from '../../core/clerk';
import { createFapiClient } from '../../core/fapiClient';
import { _authenticateWithPopup, _futureAuthenticateWithPopup, wrapWithPopupRoutes } from '../authenticateWithPopup';

const createClerk = (proxyUrl?: string) => {
  const fapiClient = createFapiClient({
    frontendApi: 'clerk.example.com',
    proxyUrl,
    instanceType: 'production',
    getSessionId: () => undefined,
  });

  return {
    client: {},
    buildUrlWithAuth: vi.fn((url: string) => url),
    getFapiClient: () => fapiClient,
  } as unknown as Clerk;
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('wrapWithPopupRoutes', () => {
  it.each([
    [undefined, 'https://clerk.example.com/v1/popup_auth_callback'],
    ['https://app.example.com/__clerk', 'https://app.example.com/__clerk/v1/popup_auth_callback'],
  ])('uses the effective FAPI URL when proxyUrl is %s', (proxyUrl, expectedCallbackUrl) => {
    const routes = wrapWithPopupRoutes(createClerk(proxyUrl), {
      redirectCallbackUrl: 'https://app.example.com/sso-callback',
      redirectUrl: 'https://app.example.com/dashboard',
    });

    const completeUrl = new URL(routes.redirectUrl);
    const callbackUrl = new URL(routes.redirectCallbackUrl);

    expect(`${completeUrl.origin}${completeUrl.pathname}`).toBe(expectedCallbackUrl);
    expect(`${callbackUrl.origin}${callbackUrl.pathname}`).toBe(expectedCallbackUrl);
    expect(completeUrl.searchParams.get('state')).toBe(routes.state);
    expect(callbackUrl.searchParams.get('state')).toBe(routes.state);
    expect(routes.state).toMatch(/^[a-f0-9]{64}$/);
    expect(callbackUrl.searchParams.get('return_url')).toContain('https://app.example.com/sso-callback');
  });
});

describe('_authenticateWithPopup', () => {
  it('only accepts a message from the FAPI origin, expected popup, and generated state', async () => {
    const clerk = createClerk();
    const popup = { location: { href: '' } } as unknown as Window;
    const navigate = vi.fn();
    const authenticateMethod = vi.fn().mockResolvedValue(undefined);
    Object.assign(clerk, { navigate });

    await _authenticateWithPopup(
      clerk,
      'signIn',
      authenticateMethod,
      {
        popup,
        strategy: 'oauth_google',
        redirectUrl: 'https://app.example.com/sso-callback',
        redirectUrlComplete: 'https://app.example.com/dashboard',
      },
      vi.fn(),
    );

    const callbackUrl = new URL(authenticateMethod.mock.calls[0][0].redirectUrl);
    const state = callbackUrl.searchParams.get('state');
    const returnUrl = callbackUrl.searchParams.get('return_url');

    window.dispatchEvent(
      new MessageEvent('message', {
        data: { return_url: returnUrl, state },
        origin: 'https://accounts.example.com',
        source: popup,
      }),
    );
    expect(navigate).not.toHaveBeenCalled();

    window.dispatchEvent(
      new MessageEvent('message', {
        data: { return_url: returnUrl, state },
        origin: 'https://clerk.example.com',
        source: popup,
      }),
    );
    expect(navigate).toHaveBeenCalledWith(returnUrl);
  });
});

describe('_futureAuthenticateWithPopup', () => {
  it('only accepts a message from the FAPI origin, expected popup, and expected state', async () => {
    const clerk = createClerk('https://app.example.com/__clerk');
    const popup = { location: { href: '' } } as unknown as Window;
    const otherPopup = { location: { href: '' } } as unknown as Window;
    const removeEventListener = vi.spyOn(window, 'removeEventListener');
    const authentication = _futureAuthenticateWithPopup(clerk, {
      popup,
      externalVerificationRedirectURL: new URL('https://oauth.example.com/authorize'),
      state: 'expected_state',
    });

    window.dispatchEvent(
      new MessageEvent('message', {
        data: { session: 'sess_123', state: 'expected_state' },
        origin: 'https://accounts.example.com',
        source: popup,
      }),
    );
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { session: 'sess_123', state: 'expected_state' },
        origin: 'https://app.example.com',
        source: otherPopup,
      }),
    );
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { session: 'sess_123', state: 'wrong_state' },
        origin: 'https://app.example.com',
        source: popup,
      }),
    );

    expect(removeEventListener).not.toHaveBeenCalled();

    window.dispatchEvent(
      new MessageEvent('message', {
        data: { session: 'sess_123', state: 'expected_state' },
        origin: 'https://app.example.com',
        source: popup,
      }),
    );

    await expect(authentication).resolves.toBeUndefined();
    expect(popup.location.href).toBe('https://oauth.example.com/authorize');
    expect(removeEventListener).toHaveBeenCalledWith('message', expect.any(Function));
  });
});
