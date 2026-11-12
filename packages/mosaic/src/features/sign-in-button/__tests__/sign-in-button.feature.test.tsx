import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { deferred } from '../../../__tests__/async';
import { holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import type { SignInButtonProps } from '../sign-in-button';
import { SignInButton } from '../sign-in-button';

function renderButton(props: SignInButtonProps = {}) {
  return renderWithClerk(<SignInButton {...props} />);
}

const button = () => screen.findByRole('button', { name: 'Sign in' });

describe('SignInButton', () => {
  it('renders its fallback while Clerk is still loading', async () => {
    serveFapi();
    const client = holdRequests('get', '/v1/client');
    const rendering = renderButton({ fallback: <output data-testid='fallback'>Loading</output> });

    await waitFor(() => expect(client.requests).toHaveLength(1));
    expect(screen.getByTestId('fallback')).toBeInTheDocument();

    client.release();
    await rendering;
    expect(screen.queryByTestId('fallback')).toBeNull();
    expect(await button()).toBeVisible();
  });

  it('redirects to sign-in with its redirect URLs', async () => {
    serveFapi();
    const { clerk } = await renderButton({
      forceRedirectUrl: '/after-sign-in',
      fallbackRedirectUrl: '/fallback-sign-in',
      signUpForceRedirectUrl: '/after-sign-up',
      signUpFallbackRedirectUrl: '/fallback-sign-up',
      initialValues: { emailAddress: 'grace@example.com' },
    });
    const redirectToSignIn = vi.spyOn(clerk, 'redirectToSignIn').mockResolvedValue(undefined);
    const openSignIn = vi.spyOn(clerk, 'openSignIn').mockImplementation(() => {});

    await userEvent.setup().click(await button());

    expect(redirectToSignIn).toHaveBeenCalledExactlyOnceWith({
      signInForceRedirectUrl: '/after-sign-in',
      signInFallbackRedirectUrl: '/fallback-sign-in',
      signUpForceRedirectUrl: '/after-sign-up',
      signUpFallbackRedirectUrl: '/fallback-sign-up',
      initialValues: { emailAddress: 'grace@example.com' },
    });
    expect(openSignIn).not.toHaveBeenCalled();
  });

  it('opens sign-in in a modal when mode is modal', async () => {
    serveFapi();
    const { clerk } = await renderButton({ mode: 'modal', forceRedirectUrl: '/after-sign-in', withSignUp: true });
    const openSignIn = vi.spyOn(clerk, 'openSignIn').mockImplementation(() => {});
    const redirectToSignIn = vi.spyOn(clerk, 'redirectToSignIn').mockResolvedValue(undefined);

    await userEvent.setup().click(await button());

    expect(openSignIn).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ forceRedirectUrl: '/after-sign-in', withSignUp: true }),
    );
    expect(redirectToSignIn).not.toHaveBeenCalled();
  });

  it('holds the button while the redirect is in flight', async () => {
    serveFapi();
    const { clerk } = await renderButton();
    const redirect = deferred<unknown>();
    const redirectToSignIn = vi.spyOn(clerk, 'redirectToSignIn').mockReturnValue(redirect.promise);
    const user = userEvent.setup();
    const trigger = await button();

    await user.click(trigger);
    await waitFor(() => expect(trigger).toBeDisabled());
    expect(trigger).toHaveAttribute('data-disabled');
    await user.click(trigger);
    expect(redirectToSignIn).toHaveBeenCalledTimes(1);

    redirect.resolve(undefined);
    await waitFor(() => expect(trigger).toBeEnabled());
  });

  it('renders an unstyled native button', async () => {
    serveFapi();
    await renderButton();

    const trigger = await button();
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('type', 'button');
    expect(trigger).not.toHaveAttribute('class');
  });

  it('takes its label from children and its element from render', async () => {
    serveFapi();
    const onClick = vi.fn();
    const { clerk } = await renderButton({
      render: <span data-testid='trigger' />,
      nativeButton: false,
      className: 'mine',
      children: 'Log in',
      onClick,
    });
    const redirectToSignIn = vi.spyOn(clerk, 'redirectToSignIn').mockResolvedValue(undefined);

    const trigger = await screen.findByTestId('trigger');
    expect(trigger).toHaveAccessibleName('Log in');
    expect(trigger).toHaveAttribute('role', 'button');
    expect(trigger).toHaveClass('mine');
    await userEvent.setup().click(trigger);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(redirectToSignIn).toHaveBeenCalledTimes(1);
  });
});
