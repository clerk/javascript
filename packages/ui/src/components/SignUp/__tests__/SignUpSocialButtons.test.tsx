import { waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

import { SignUpSocialButtons } from '../SignUpSocialButtons';

const { createFixtures } = bindCreateFixtures('SignUp');

const registerOAuthTransport = (clerk: unknown) => {
  Object.defineProperty(clerk, '__internal_hasOAuthTransport', {
    configurable: true,
    value: true,
  });
};

describe('SignUpSocialButtons', () => {
  it('with a transport registered, calls authenticateWithRedirect with __internal_callbackParams and never opens a popup', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withSocialProvider({ provider: 'google' });
    });
    props.setProps({
      oauthFlow: 'popup',
      unsafeMetadata: { source: 'test' },
      oidcPrompt: 'select_account',
    } as any);
    registerOAuthTransport(fixtures.clerk);
    fixtures.signUp.authenticateWithRedirect.mockResolvedValue(undefined as any);
    const openSpy = vi.spyOn(window, 'open').mockReturnValue({ closed: false } as Window);

    const { userEvent } = render(
      <CardStateProvider>
        <SignUpSocialButtons
          enableOAuthProviders
          enableWeb3Providers={false}
          enableAlternativePhoneCodeProviders={false}
          continueSignUp
          legalAccepted
        />
      </CardStateProvider>,
      { wrapper },
    );

    await userEvent.click(screen.getByText('Continue with Google'));

    expect(openSpy).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(fixtures.signUp.authenticateWithRedirect).toHaveBeenCalledWith({
        strategy: 'oauth_google',
        redirectUrl: 'http://localhost:3000/#/sso-callback',
        redirectUrlComplete: '/',
        continueSignUp: true,
        unsafeMetadata: { source: 'test' },
        legalAccepted: true,
        oidcPrompt: 'select_account',
        __internal_callbackParams: expect.objectContaining({
          signUpUrl: expect.any(String),
          signInUrl: expect.any(String),
          signUpForceRedirectUrl: '/',
          signInForceRedirectUrl: '/',
          secondFactorUrl: expect.any(String),
          continueSignUpUrl: 'continue',
          verifyEmailAddressUrl: 'verify-email-address',
          verifyPhoneNumberUrl: 'verify-phone-number',
          unsafeMetadata: { source: 'test' },
          __internal_navigateOnSetActive: expect.any(Function),
        }),
      });
    });
    expect(fixtures.signUp.authenticateWithPopup).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('with a transport registered, clears loading when authenticateWithRedirect rejects', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withSocialProvider({ provider: 'google' });
    });
    props.setProps({ oauthFlow: 'popup' } as any);
    registerOAuthTransport(fixtures.clerk);
    fixtures.signUp.authenticateWithRedirect.mockRejectedValue(new Error('cancelled'));

    const { userEvent } = render(
      <CardStateProvider>
        <SignUpSocialButtons
          enableOAuthProviders
          enableWeb3Providers={false}
          enableAlternativePhoneCodeProviders={false}
        />
      </CardStateProvider>,
      { wrapper },
    );

    const button = screen.getByRole('button', { name: /continue with google/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });
});
