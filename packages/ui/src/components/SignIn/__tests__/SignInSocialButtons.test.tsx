import { waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';

import { SignInSocialButtons } from '../SignInSocialButtons';

const { createFixtures } = bindCreateFixtures('SignIn');

const registerOAuthTransport = (clerk: unknown) => {
  Object.defineProperty(clerk, '__internal_hasOAuthTransport', {
    configurable: true,
    value: true,
  });
};

describe('SignInSocialButtons', () => {
  it('with a transport registered, calls authenticateWithRedirect with __internal_callbackParams and never opens a popup', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withSocialProvider({ provider: 'google' });
    });
    props.setProps({ oauthFlow: 'popup' } as any);
    registerOAuthTransport(fixtures.clerk);
    fixtures.signIn.authenticateWithRedirect.mockResolvedValue(undefined as any);
    const openSpy = vi.spyOn(window, 'open').mockReturnValue({ closed: false } as Window);

    const { userEvent } = render(
      <CardStateProvider>
        <SignInSocialButtons
          enableOAuthProviders
          enableWeb3Providers={false}
          enableAlternativePhoneCodeProviders={false}
        />
      </CardStateProvider>,
      { wrapper },
    );

    await userEvent.click(screen.getByText('Continue with Google'));

    expect(openSpy).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(fixtures.signIn.authenticateWithRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          strategy: 'oauth_google',
          __internal_callbackParams: expect.objectContaining({
            signInUrl: expect.any(String),
            firstFactorUrl: 'factor-one',
            secondFactorUrl: 'factor-two',
            resetPasswordUrl: 'reset-password',
            navigateOnSetActive: expect.any(Function),
          }),
        }),
      );
    });
    openSpy.mockRestore();
  });

  it('with a transport registered, clears loading when authenticateWithRedirect rejects', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withSocialProvider({ provider: 'google' });
    });
    props.setProps({ oauthFlow: 'popup' } as any);
    registerOAuthTransport(fixtures.clerk);
    fixtures.signIn.authenticateWithRedirect.mockRejectedValue(new Error('cancelled'));

    const { userEvent } = render(
      <CardStateProvider>
        <SignInSocialButtons
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
