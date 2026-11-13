import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { deferred } from '../../../__tests__/async';
import { holdRequests, serveFapi } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';
import { renderWithClerk } from '../../../__tests__/feature/render';
import type { SignOutButtonProps } from '../sign-out-button';
import { SignOutButton } from '../sign-out-button';

function serveSignedIn() {
  return serveFapi({
    client: fapiClient([fapiSession({ id: 'sess_sign_out', user: fapiUser({ id: 'user_sign_out' }) })]),
  });
}

function tree(props: SignOutButtonProps = {}) {
  return (
    <div data-testid='host'>
      <SignOutButton {...props} />
    </div>
  );
}

const button = () => screen.findByRole('button', { name: 'Sign out' });

describe('SignOutButton', () => {
  it('renders its fallback while Clerk is still loading', async () => {
    serveSignedIn();
    const client = holdRequests('get', '/v1/client');
    const rendering = renderWithClerk(tree({ fallback: <output data-testid='fallback'>Loading</output> }));

    await waitFor(() => expect(client.requests).toHaveLength(1));
    expect(screen.getByTestId('fallback')).toBeInTheDocument();

    client.release();
    await rendering;
    expect(screen.queryByTestId('fallback')).toBeNull();
    expect(await button()).toBeVisible();
  });

  it('renders nothing when nobody is signed in', async () => {
    serveFapi();
    await renderWithClerk(tree({ fallback: <output>Loading</output> }));

    expect(screen.getByTestId('host')).toBeEmptyDOMElement();
  });

  it('signs out with its redirect URL and session', async () => {
    serveSignedIn();
    const { clerk } = await renderWithClerk(tree({ redirectUrl: '/goodbye', sessionId: 'sess_sign_out' }));
    const signOut = vi.spyOn(clerk, 'signOut').mockResolvedValue(undefined);

    await userEvent.setup().click(await button());

    expect(signOut).toHaveBeenCalledExactlyOnceWith({ redirectUrl: '/goodbye', sessionId: 'sess_sign_out' });
  });

  it('holds the button while signing out', async () => {
    serveSignedIn();
    const { clerk } = await renderWithClerk(tree());
    const signingOut = deferred<undefined>();
    const signOut = vi.spyOn(clerk, 'signOut').mockReturnValue(signingOut.promise);
    const user = userEvent.setup();
    const trigger = await button();

    await user.click(trigger);
    await waitFor(() => expect(trigger).toBeDisabled());
    expect(trigger).toHaveAttribute('data-disabled');
    await user.click(trigger);
    expect(signOut).toHaveBeenCalledTimes(1);

    signingOut.resolve(undefined);
    await waitFor(() => expect(trigger).toBeEnabled());
  });

  it('renders an unstyled native button', async () => {
    serveSignedIn();
    await renderWithClerk(tree());

    const trigger = await button();
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('type', 'button');
    expect(trigger).not.toHaveAttribute('class');
  });

  it('takes its label from children and its element from render', async () => {
    serveSignedIn();
    const onClick = vi.fn();
    const { clerk } = await renderWithClerk(
      tree({
        render: <span data-testid='trigger' />,
        nativeButton: false,
        className: 'mine',
        children: 'Log out',
        onClick,
      }),
    );
    const signOut = vi.spyOn(clerk, 'signOut').mockResolvedValue(undefined);

    const trigger = await screen.findByTestId('trigger');
    expect(trigger).toHaveAccessibleName('Log out');
    expect(trigger).toHaveAttribute('role', 'button');
    expect(trigger).toHaveClass('mine');
    await userEvent.setup().click(trigger);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
