import { createDeferredPromise } from '@clerk/shared/utils';
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { UserProfileConnectedAccountRowView } from '../user-profile-connected-account-row.view';
import type {
  UserProfileConnectedAccount,
  UserProfileConnectionProvider,
} from '../user-profile-connected-accounts-section.types';

type Animated = { getAnimations?: () => Animation[] };

function holdExits() {
  const exit = createDeferredPromise();
  (Element.prototype as Animated).getAnimations = () => [{ finished: exit.promise } as Animation];
  return exit;
}

const provider: UserProfileConnectionProvider = { id: 'oauth_google', provider: 'Google' };
const account: UserProfileConnectedAccount = {
  id: 'idn_google',
  providerId: 'oauth_google',
  provider: 'Google',
  identifier: 'ada@example.com',
  status: 'connected',
};

const description = () => screen.getByText('ada@example.com').closest('.cl-section-description');

describe('UserProfileConnectedAccountRowView', () => {
  afterEach(() => {
    delete (Element.prototype as Animated).getAnimations;
  });

  it('offers Connect for a provider that is not connected', () => {
    const onConnect = vi.fn();
    render(
      <UserProfileConnectedAccountRowView
        provider={provider}
        onConnect={onConnect}
      />,
    );

    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.queryByText('ada@example.com')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Manage Google' })).not.toBeInTheDocument();
    screen.getByRole('button', { name: 'Connect Google' }).click();
    expect(onConnect).toHaveBeenCalledExactlyOnceWith('oauth_google');
  });

  it('shows a first-load identifier without an entrance', () => {
    render(<UserProfileConnectedAccountRowView account={account} />);

    expect(description()).toHaveAttribute('data-open');
    expect(description()).not.toHaveAttribute('data-starting-style');
    expect(description()).toHaveAttribute('title', 'ada@example.com');
  });

  it('becomes the connected row in place when its provider connects', () => {
    const { rerender } = render(
      <UserProfileConnectedAccountRowView
        provider={provider}
        onConnect={vi.fn()}
      />,
    );
    const row = screen.getByText('Google').closest('.cl-section-row');

    rerender(
      <UserProfileConnectedAccountRowView
        account={account}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByText('Google').closest('.cl-section-row')).toBe(row);
    expect(description()).toHaveAttribute('data-starting-style');
    expect(screen.queryByRole('button', { name: 'Connect Google' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage Google' })).toBeInTheDocument();
  });

  it('offers Connect again in place while the identifier collapses out', async () => {
    const exit = holdExits();
    const { rerender } = render(
      <UserProfileConnectedAccountRowView
        account={account}
        onRemove={vi.fn()}
      />,
    );
    const row = screen.getByText('Google').closest('.cl-section-row');

    rerender(
      <UserProfileConnectedAccountRowView
        provider={provider}
        onConnect={vi.fn()}
      />,
    );

    expect(screen.getByText('Google').closest('.cl-section-row')).toBe(row);
    expect(description()).toHaveAttribute('data-ending-style');
    expect(description()).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button', { name: 'Connect Google' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Manage Google' })).not.toBeInTheDocument();

    await act(async () => {
      exit.resolve();
      await exit.promise;
    });
    expect(screen.queryByText('ada@example.com')).not.toBeInTheDocument();
  });

  it('holds the identifier through its exit once the account loses it', async () => {
    const exit = holdExits();
    const { rerender } = render(<UserProfileConnectedAccountRowView account={account} />);

    rerender(<UserProfileConnectedAccountRowView account={{ ...account, identifier: undefined }} />);
    expect(description()).toHaveAttribute('data-ending-style');

    await act(async () => {
      exit.resolve();
      await exit.promise;
    });
    expect(screen.queryByText('ada@example.com')).not.toBeInTheDocument();
  });

  it('shows the provider connect error and the account errors on the same row', () => {
    const { rerender } = render(
      <UserProfileConnectedAccountRowView
        provider={{ ...provider, connectError: 'Unable to connect.' }}
        onConnect={vi.fn()}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to connect.');

    rerender(
      <UserProfileConnectedAccountRowView
        account={{ ...account, status: 'reconnect', reconnectError: 'Try again.' }}
      />,
    );
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Try again.');
  });
});
