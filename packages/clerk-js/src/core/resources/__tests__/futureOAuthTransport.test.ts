// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BaseResource, SignIn, SignUp } from '../internal';

afterEach(() => vi.restoreAllMocks());

describe.each([
  ['signIn', SignIn],
  ['signUp', SignUp],
] as const)('%s future OAuth transport', (name, Resource) => {
  function setup(callback: string | Error = 'app://callback?rotating_token_nonce=nonce') {
    const open = vi.fn(async () => {
      if (callback instanceof Error) throw callback;
      return { callbackUrl: callback };
    });
    const setActive = vi.fn();
    const navigate = vi.fn();
    BaseResource.clerk = {
      client: { captchaBypass: true },
      __internal_oauthTransport: { getRedirectUrl: async () => 'app://callback', open },
      __internal_windowNavigate: navigate,
      setActive,
    } as any;
    const fetch = vi.spyOn(BaseResource, '_fetch').mockImplementation(async request => {
      const completed = request.method === 'GET';
      const verification = {
        status: completed ? 'verified' : 'unverified',
        strategy: 'oauth_google',
        external_verification_redirect_url: 'https://provider.example/auth',
      };
      return {
        response: {
          id: 'attempt',
          status: completed ? 'complete' : 'needs_first_factor',
          created_session_id: completed ? 'session' : null,
          first_factor_verification: verification,
          verifications: { external_account: verification },
        },
      } as any;
    });
    const attempt = new Resource().__internal_future;
    return { attempt, fetch, open, setActive, navigate };
  }

  it('prepares through the future implementation and reconciles the callback without activation or navigation', async () => {
    const f = setup();
    expect(typeof window).toBe('undefined');
    const result = await f.attempt.sso({
      strategy: 'oauth_google',
      redirectUrl: '/destination',
      redirectCallbackUrl: '/callback',
    });
    expect(result.error).toBeNull();
    expect(f.fetch.mock.calls[0][0]).toMatchObject({
      body: {
        strategy: 'oauth_google',
        redirectUrl: 'app://callback',
        actionCompleteRedirectUrl: 'app://callback',
      },
    });
    expect(f.fetch.mock.calls[1][0]).toMatchObject({ method: 'GET', rotatingTokenNonce: 'nonce' });
    expect(f.open).toHaveBeenCalledWith(new URL('https://provider.example/auth'));
    expect(f.attempt.status).toBe('complete');
    expect(f.attempt.createdSessionId).toBe('session');
    expect(f.setActive).not.toHaveBeenCalled();
    expect(f.navigate).not.toHaveBeenCalled();
  });

  it('returns browser cancellation without a reconciliation request', async () => {
    const cancelled = Object.assign(new Error('Cancelled'), { code: 'user_cancelled' });
    const f = setup(cancelled);
    const result = await f.attempt.sso({
      strategy: 'oauth_google',
      redirectUrl: '/destination',
      redirectCallbackUrl: '/callback',
    });
    expect(result.error).toBe(cancelled);
    expect(f.fetch).toHaveBeenCalledTimes(1);
    expect(f.setActive).not.toHaveBeenCalled();
  });

  it('rejects a callback for another app before using its nonce', async () => {
    const f = setup('other://callback?rotating_token_nonce=wrong');
    const result = await f.attempt.sso({
      strategy: 'oauth_google',
      redirectUrl: '/destination',
      redirectCallbackUrl: '/callback',
    });
    expect(result.error).toMatchObject({ code: 'oauth_transport_callback_mismatch' });
    expect(f.fetch).toHaveBeenCalledTimes(1);
  });
});
