import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useSignInContext, useSignUpContext } from '@/contexts';
import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, renderHook, waitFor } from '@/test/utils';

import { PathRouter } from '../../../router';
import { SignIn } from '../index';

const { createFixtures: createSignInFixtures } = bindCreateFixtures('SignIn');
const { createFixtures: createSignUpFixtures } = bindCreateFixtures('SignUp');

// The fixtures' publishable key resolves to this Frontend API host.
const FAPI_ORIGIN = 'https://clerk.abcef.12345.prod.lclclerk.com';
const AUTHORIZATION_QUERY =
  'target_flow=chatgpt_siwc&client_id=client&state=state&redirect_uri=https%3A%2F%2Fchatgpt.com%2Fcallback&code_challenge=challenge&code_challenge_method=S256';
const trustedContinuation = `${FAPI_ORIGIN}/oauth/authorize/continue?${AUTHORIZATION_QUERY}`;

const setWindowQuery = (params: Record<string, string>) => {
  window.history.replaceState({}, '', `/sign-in?${new URLSearchParams(params).toString()}`);
};

afterEach(() => {
  window.history.replaceState({}, '', '/');
});

describe('ChatGPTSIWCContext_HostQuery', () => {
  it.each([
    ['SignIn', createSignInFixtures, () => useSignInContext()],
    ['SignUp', createSignUpFixtures, () => useSignUpContext()],
  ] as const)(
    'ChatGPTSIWCContext_HostQuery_NonSIWC_%s_VirtualRoutingIgnoresHostQuery',
    async (_, createFixtures, useContext) => {
      const { wrapper, fixtures, props } = await createFixtures();
      props.setProps({ routing: 'virtual' } as any);
      // GIVEN a modal on a host page whose own query looks like Clerk params
      setWindowQuery({
        redirect_url: 'https://host.example/after',
        sign_in_force_redirect_url: 'https://host.example/forced',
        email_address: 'host@example.com',
      });
      fixtures.router.queryParams = {};

      // WHEN the component context is built
      const { result } = renderHook(useContext, { wrapper });

      // THEN virtual routing still starts from the router's (empty) query
      expect(result.current.queryParams).toEqual({});
      expect(result.current.initialValues?.emailAddress).toBeUndefined();
      expect(result.current.afterSignInUrl).not.toContain('host.example');
      expect(result.current.signUpUrl).not.toContain('host.example');
    },
  );

  it('ChatGPTSIWCContext_HostQuery_SIWC_VirtualRoutingSeesOnlySIWCKeys', async () => {
    const { wrapper, fixtures, props } = await createSignInFixtures();
    props.setProps({ routing: 'virtual' } as any);
    // GIVEN FAPI sent the browser to sign-in with a SIWC continuation and an unrelated host param
    setWindowQuery({
      target_flow: 'chatgpt_siwc',
      redirect_url: trustedContinuation,
      email_address: 'user@example.com',
      __clerk_siwc_prompt_login: 'true',
      unrelated: 'value',
    });
    fixtures.router.queryParams = {};

    const { result } = renderHook(() => useSignInContext(), { wrapper });

    // THEN only the SIWC keys reach the flow
    expect(result.current.queryParams).toEqual({
      target_flow: 'chatgpt_siwc',
      redirect_url: trustedContinuation,
      email_address: 'user@example.com',
      __clerk_siwc_prompt_login: 'true',
    });
  });
});

describe('ChatGPTSIWCContext_ContinuationOrigin', () => {
  it.each([
    ['continuation on another origin', `https://evil.example/oauth/authorize/continue?${AUTHORIZATION_QUERY}`, false],
    ['continuation on the Frontend API', trustedContinuation, true],
    ['consent on a disallowed origin', `https://evil.example/oauth-consent?${AUTHORIZATION_QUERY}`, false],
    ['consent on an allowed origin', `https://accounts.example.com/oauth-consent?${AUTHORIZATION_QUERY}`, true],
  ])('ChatGPTSIWCContext_ContinuationOrigin_%s', async (_, redirectUrl, trusted) => {
    const { wrapper, fixtures } = await createSignInFixtures();
    fixtures.options.allowedRedirectOrigins = ['https://accounts.example.com'];
    fixtures.router.queryParams = {
      target_flow: 'chatgpt_siwc',
      redirect_url: redirectUrl,
      __clerk_siwc_account_mismatch: 'true',
    };

    const { result } = renderHook(() => useSignInContext(), { wrapper });

    // An untrusted continuation keeps its redirect_url (RedirectUrls filters it) but loses the SIWC markers.
    expect(result.current.queryParams.target_flow).toBe(trusted ? 'chatgpt_siwc' : undefined);
    expect(result.current.queryParams.__clerk_siwc_account_mismatch).toBe(trusted ? 'true' : undefined);
  });
});

describe('ChatGPTSIWCContext_AccountChoice', () => {
  const pendingQueryParams = {
    target_flow: 'chatgpt_siwc',
    redirect_url: trustedContinuation,
    __clerk_siwc_account_choice_pending: 'true',
  };

  it('ChatGPTSIWCContext_AccountChoice_Pending_SSOCallbackURLKeepsMarkers', async () => {
    const { wrapper, fixtures, props } = await createSignInFixtures();
    props.setProps({ routing: 'path', path: '/sign-in' } as any);
    fixtures.router.queryParams = { ...pendingQueryParams };

    const { result } = renderHook(() => useSignInContext(), { wrapper });

    const callback = new URL(result.current.ssoCallbackUrl, window.location.origin);
    expect(callback.pathname).toBe('/sign-in/sso-callback');
    expect(callback.searchParams.get('target_flow')).toBe('chatgpt_siwc');
    expect(callback.searchParams.get('__clerk_siwc_account_choice_pending')).toBe('true');
    expect(callback.searchParams.get('redirect_url')).toBe(trustedContinuation);
  });

  it('ChatGPTSIWCContext_AccountChoice_NotPending_SSOCallbackURLUnchanged', async () => {
    const { wrapper, fixtures, props } = await createSignInFixtures();
    props.setProps({ routing: 'path', path: '/sign-in' } as any);
    fixtures.router.queryParams = { redirect_url: trustedContinuation };

    const { result } = renderHook(() => useSignInContext(), { wrapper });

    const callback = new URL(result.current.ssoCallbackUrl, window.location.origin);
    expect(callback.searchParams.has('target_flow')).toBe(false);
    expect(callback.searchParams.has('__clerk_siwc_account_choice_pending')).toBe(false);
  });

  it('ChatGPTSIWCContext_AccountChoice_AcknowledgementFails_StillResumesAuthorization', async () => {
    const { wrapper, fixtures } = await createSignInFixtures();
    fixtures.router.queryParams = { ...pendingQueryParams };
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const session = {
      currentTask: undefined,
      __internal_acknowledgeChatGPTAccountChoice: vi.fn().mockRejectedValue(new Error('expired')),
    };

    try {
      const { result } = renderHook(() => useSignInContext(), { wrapper });
      await result.current.navigateOnSetActive({
        session: session as any,
        redirectUrl: trustedContinuation,
        decorateUrl: url => url,
      });

      // FAPI asks for the account again, so the user is sent on instead of stranded.
      expect(session.__internal_acknowledgeChatGPTAccountChoice).toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalled();
      expect(fixtures.router.navigate).toHaveBeenCalledWith(trustedContinuation);
    } finally {
      consoleError.mockRestore();
    }
  });

  it.each([
    ['pending', pendingQueryParams, true],
    ['not pending', { redirect_url: trustedContinuation }, false],
  ])(
    'ChatGPTSIWCContext_AccountChoice_SSOCallback_%s_RecordsChoiceOnSetActive',
    async (_, queryParams, expectsHook) => {
      const { wrapper, fixtures, props } = await createSignInFixtures();
      props.setProps({ routing: 'path', path: '/sign-in' } as any);
      fixtures.clerk.handleRedirectCallback.mockReturnValue(new Promise(() => {}));
      window.history.replaceState(
        {},
        '',
        `/sign-in/sso-callback?${new URLSearchParams(queryParams as Record<string, string>).toString()}`,
      );

      render(
        <React.Suspense fallback={null}>
          <PathRouter basePath='/sign-in'>
            <SignIn />
          </PathRouter>
        </React.Suspense>,
        { wrapper },
      );

      await waitFor(() => expect(fixtures.clerk.handleRedirectCallback).toHaveBeenCalled());
      const [params] = fixtures.clerk.handleRedirectCallback.mock.calls[0];
      expect(typeof params.__internal_navigateOnSetActive === 'function').toBe(expectsHook);
    },
  );
});
