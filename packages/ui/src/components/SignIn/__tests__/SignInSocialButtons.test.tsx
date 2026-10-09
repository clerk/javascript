import { waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
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
  it('starts the existing ChatGPT OAuth redirect for the plugin flow', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withSocialProvider({ provider: 'chatgpt' });
    });
    fixtures.router.queryParams = {
      target_flow: 'chatgpt_siwc',
      redirect_url:
        'https://clerk.example.test/v1/oauth/authorize/continue?target_flow=chatgpt_siwc&client_id=client&state=state&redirect_uri=https%3A%2F%2Fchatgpt.com%2Fcallback&code_challenge=challenge&code_challenge_method=S256',
      login_hint: 'user@example.com',
      __clerk_siwc_prompt_login: 'true',
    } as any;
    fixtures.signIn.authenticateWithRedirect.mockResolvedValue(undefined as any);

    render(
      <CardStateProvider>
        <SignInSocialButtons
          enableOAuthProviders
          enableWeb3Providers={false}
          enableAlternativePhoneCodeProviders={false}
          autoStartChatGPT
        />
      </CardStateProvider>,
      { wrapper },
    );

    await waitFor(() => {
      expect(fixtures.signIn.authenticateWithRedirect).toHaveBeenCalledWith(
        expect.objectContaining({
          strategy: 'oauth_chatgpt',
          oidcPrompt: 'login',
          oidcLoginHint: 'user@example.com',
        }),
      );
    });
  });

  it('does not send the SIWC prompt or login hint to another social provider', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withSocialProvider({ provider: 'google' });
    });
    fixtures.router.queryParams = {
      target_flow: 'chatgpt_siwc',
      redirect_url:
        'https://clerk.example.test/v1/oauth/authorize/continue?target_flow=chatgpt_siwc&client_id=client&state=state&redirect_uri=https%3A%2F%2Fchatgpt.com%2Fcallback&code_challenge=challenge&code_challenge_method=S256',
      login_hint: 'user@example.com',
      __clerk_siwc_prompt_login: 'true',
    } as any;
    fixtures.signIn.authenticateWithRedirect.mockResolvedValue(undefined as any);

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

    await userEvent.click(screen.getByRole('button', { name: /continue with google/i }));

    await waitFor(() => {
      expect(fixtures.signIn.authenticateWithRedirect).toHaveBeenCalledWith(
        expect.objectContaining({ strategy: 'oauth_google' }),
      );
    });
    const [params] = fixtures.signIn.authenticateWithRedirect.mock.calls[0];
    expect(params.oidcPrompt).toBeUndefined();
    expect(params.oidcLoginHint).toBeUndefined();
  });

  it('clears the loading state after restoring the page from browser history', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withSocialProvider({ provider: 'chatgpt' });
    });
    fixtures.router.queryParams = {
      target_flow: 'chatgpt_siwc',
      redirect_url:
        'https://clerk.example.test/v1/oauth/authorize/continue?target_flow=chatgpt_siwc&client_id=client&state=state&redirect_uri=https%3A%2F%2Fchatgpt.com%2Fcallback&code_challenge=challenge&code_challenge_method=S256',
    } as any;
    fixtures.signIn.authenticateWithRedirect.mockReturnValue(new Promise(() => {}));

    render(
      <CardStateProvider>
        <SignInSocialButtons
          enableOAuthProviders
          enableWeb3Providers={false}
          enableAlternativePhoneCodeProviders={false}
          autoStartChatGPT
        />
      </CardStateProvider>,
      { wrapper },
    );

    await waitFor(() => expect(screen.getByRole('button', { name: /continue with chatgpt/i })).toBeDisabled());

    const event = new Event('pageshow');
    Object.defineProperty(event, 'persisted', { value: true });
    fireEvent(window, event);

    await waitFor(() => expect(screen.getByRole('button', { name: /continue with chatgpt/i })).toBeEnabled());
  });

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
            __internal_navigateOnSetActive: expect.any(Function),
            __internal_navigate: expect.any(Function),
          }),
        }),
      );
    });
    openSpy.mockRestore();
  });

  it('with virtual routing and withSignUp, redirects back to the sign-in sso-callback route', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withSocialProvider({ provider: 'google' });
    });
    props.setProps({ routing: 'virtual', withSignUp: true, oauthFlow: 'redirect' } as any);
    fixtures.signIn.authenticateWithRedirect.mockResolvedValue(undefined as any);

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

    await waitFor(() => {
      expect(fixtures.signIn.authenticateWithRedirect).toHaveBeenCalled();
    });
    expect(fixtures.signIn.authenticateWithRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        strategy: 'oauth_google',
        redirectUrl: 'https://dashboard.clerk.com/sign-in#/sso-callback',
      }),
    );
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
