import { ClerkAPIResponseError } from '@clerk/shared/error';
import { createDeferredPromise } from '@clerk/shared/utils';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, renderHook } from '@/test/utils';
import { useSocialAuthenticationController } from '@/ui/common/useSocialAuthenticationController';
import { CardStateProvider, useCardState } from '@/ui/elements/contexts';

import { useSignUpSocialButtonsModel } from '../sign-up-social-buttons.model';

const { createFixtures } = bindCreateFixtures('SignUp');
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const setup = async () => {
  const { wrapper: Fixture, fixtures, props } = await createFixtures();
  props.setProps({ oauthFlow: 'popup', unsafeMetadata: { source: 'test' }, oidcPrompt: 'select_account' });
  const wrapper = ({ children }: PropsWithChildren) => (
    <Fixture>
      <CardStateProvider>{children}</CardStateProvider>
    </Fixture>
  );
  const request = createDeferredPromise<void>();
  const sdk = fixtures.signUp.authenticateWithPopup.mockReturnValue(request.promise);
  const open = vi.spyOn(window, 'open').mockReturnValue({ closed: false } as Window);
  vi.useFakeTimers();
  const hook = renderHook(
    options => {
      const model = useSignUpSocialButtonsModel(options);
      return { model, controller: useSocialAuthenticationController(model), card: useCardState() };
    },
    { wrapper, initialProps: { continueSignUp: true, legalAccepted: true } },
  );
  return { ...hook, request, sdk, open, fixtures, timers: vi.getTimerCount() };
};

describe('Sign-up social authentication ownership', () => {
  it('opens a popup synchronously and keeps consent, continuation, metadata, and OIDC options', async () => {
    const { result, open, sdk, request, timers } = await setup();
    const pending = result.current.controller.oauthCallback('oauth_google');
    expect(open).toHaveBeenCalledTimes(1);
    expect(sdk).toHaveBeenCalledWith(
      expect.objectContaining({
        strategy: 'oauth_google',
        popup: open.mock.results[0].value,
        continueSignUp: true,
        legalAccepted: true,
        unsafeMetadata: { source: 'test' },
        oidcPrompt: 'select_account',
      }),
    );
    request.resolve();
    await pending;
    expect(vi.getTimerCount()).toBe(timers);
  });

  it('uses the current consent and continuation values after render', async () => {
    const { result, rerender, sdk, request } = await setup();
    rerender({ continueSignUp: false, legalAccepted: false });
    const pending = result.current.controller.oauthCallback('oauth_google');
    expect(sdk).toHaveBeenCalledWith(expect.objectContaining({ continueSignUp: false, legalAccepted: false }));
    request.resolve();
    await pending;
  });

  it('prevents duplicate popup requests across renders', async () => {
    const { result, rerender, sdk, request, open } = await setup();
    const pending = result.current.controller.oauthCallback('oauth_google');
    rerender({ continueSignUp: true, legalAccepted: true });
    await result.current.controller.oauthCallback('oauth_google');
    expect(sdk).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledTimes(1);
    request.resolve();
    await pending;
  });

  it('clears polling on closure and suppresses a late SDK error', async () => {
    const { result, request, unmount } = await setup();
    const interval = vi.spyOn(globalThis, 'setInterval');
    const clear = vi.spyOn(globalThis, 'clearInterval');
    const pending = result.current.controller.oauthCallback('oauth_google');
    const timer = interval.mock.results[0].value;
    unmount();
    expect(clear).toHaveBeenCalledWith(timer);
    request.reject(new Error('Late failure'));
    await expect(pending).resolves.toBeUndefined();
  });

  it('does not display a late error after the canonical account changes before render', async () => {
    const { result, request, fixtures } = await setup();
    const pending = result.current.controller.oauthCallback('oauth_google');
    vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ id: 'other' } as never);
    await act(async () => {
      request.reject(
        new ClerkAPIResponseError('Failed', {
          status: 500,
          data: [{ code: 'internal_server_error', message: 'Failed' }],
        }),
      );
      await pending;
    });
    expect(result.current.card.error).toBeUndefined();
  });

  it.each(['user', 'session', 'client', 'organization'] as const)(
    'blocks SDK commands after canonical %s changes',
    async field => {
      const { result, fixtures, sdk } = await setup();
      const web3 = vi.spyOn(fixtures.clerk, 'authenticateWithWeb3').mockResolvedValue(undefined);
      vi.spyOn(fixtures.clerk, field, 'get').mockReturnValue({ ...fixtures.clerk[field], id: 'other' } as never);
      await result.current.model.authenticateWithPopup('oauth_google', null);
      await result.current.model.authenticateWithRedirect('oauth_google');
      await result.current.model.authenticateWithWeb3('web3_metamask_signature');
      expect(sdk).not.toHaveBeenCalled();
      expect(fixtures.signUp.authenticateWithRedirect).not.toHaveBeenCalled();
      expect(web3).not.toHaveBeenCalled();
    },
  );

  it('blocks a retained model command after closure', async () => {
    const { result, sdk, unmount } = await setup();
    const command = result.current.model.authenticateWithPopup;
    unmount();
    await command('oauth_google', null);
    expect(sdk).not.toHaveBeenCalled();
  });

  it('permits the SDK to assign a new sign-up attempt ID', async () => {
    const { result, sdk, fixtures, request } = await setup();
    fixtures.signUp.id = 'attempt_1';
    sdk.mockImplementation(() => {
      fixtures.signUp.id = 'attempt_2';
      return request.promise;
    });
    const pending = result.current.controller.oauthCallback('oauth_google');
    expect(result.current.model.canRun()).toBe(true);
    request.resolve();
    await pending;
  });

  it('does not expose the Web3 SDK response and keeps consent and metadata', async () => {
    const { result, fixtures } = await setup();
    const sdk = vi.spyOn(fixtures.clerk, 'authenticateWithWeb3').mockResolvedValue({ privateResponse: true });
    await expect(result.current.model.authenticateWithWeb3('web3_metamask_signature')).resolves.toBeUndefined();
    expect(sdk).toHaveBeenCalledWith(
      expect.objectContaining({ legalAccepted: true, unsafeMetadata: { source: 'test' } }),
    );
  });

  it('routes Solana to wallet selection without calling the Web3 SDK', async () => {
    const { result, fixtures } = await setup();
    const sdk = vi.spyOn(fixtures.clerk, 'authenticateWithWeb3');
    await result.current.model.authenticateWithWeb3('web3_solana_signature');
    expect(fixtures.router.navigate).toHaveBeenCalledWith('choose-wallet?strategy=web3_solana_signature');
    expect(sdk).not.toHaveBeenCalled();
  });
});
