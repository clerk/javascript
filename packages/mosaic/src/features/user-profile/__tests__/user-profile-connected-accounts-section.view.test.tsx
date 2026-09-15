import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { UserProfileConnectedAccountsSectionView } from '../user-profile-connected-accounts-section.view';

const account = { id: 'account_1', provider: 'Google', identifier: 'test@example.com' };

describe('connected accounts section', () => {
  it.each([{ availableProviders: [] }, { availableProviders: [{ id: 'google', provider: 'Google' }] }])(
    'hides the entire section without accounts or actionable providers (%j)',
    ({ availableProviders }) => {
      const { container } = render(
        <UserProfileConnectedAccountsSectionView
          accounts={[]}
          availableProviders={availableProviders}
        />,
      );
      expect(container).toBeEmptyDOMElement();
    },
  );

  it('shows provider names without announcing decorative logos', () => {
    render(
      <UserProfileConnectedAccountsSectionView
        accounts={[{ ...account, iconUrl: 'https://img.clerk.com/static/google.svg' }]}
      />,
    );
    expect(screen.getByText('Google')).toBeVisible();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('shows connection errors while keeping Connect available', () => {
    render(
      <UserProfileConnectedAccountsSectionView
        accounts={[]}
        availableProviders={[{ id: 'apple', provider: 'Apple', connectError: 'Connection failed' }]}
        onConnect={vi.fn()}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Connection failed');
    expect(screen.getByRole('button', { name: 'Connect Apple' })).toBeEnabled();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('keeps confirmation open for pending and error props and forwards retry', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const { rerender } = render(
      <UserProfileConnectedAccountsSectionView
        accounts={[account]}
        onRemove={onRemove}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Manage Google' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove' }));
    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveTextContent('dependent features');
    await user.click(within(dialog).getByRole('button', { name: 'Remove', exact: true }));
    expect(onRemove).toHaveBeenCalledExactlyOnceWith('account_1');
    rerender(
      <UserProfileConnectedAccountsSectionView
        accounts={[{ ...account, isRemoving: true }]}
        onRemove={onRemove}
      />,
    );
    expect(within(dialog).getByRole('button', { name: 'Remove', exact: true })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(within(dialog).getByRole('progressbar')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Remove', exact: true }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(dialog).toBeInTheDocument();
    rerender(
      <UserProfileConnectedAccountsSectionView
        accounts={[{ ...account, removalError: 'Try again' }]}
        onRemove={onRemove}
      />,
    );
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Try again');
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeEnabled();
    await user.click(within(dialog).getByRole('button', { name: 'Remove', exact: true }));
    expect(onRemove).toHaveBeenCalledTimes(2);
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Manage Google' })).toHaveFocus();
  });

  it('renders reconnect and verification errors without a generic manage action', async () => {
    const user = userEvent.setup();
    const onReconnect = vi.fn();
    render(
      <UserProfileConnectedAccountsSectionView
        accounts={[
          { ...account, status: 'reconnect', reconnectError: 'Reconnection failed' },
          { id: 'other', provider: 'Other', status: 'error', verificationError: 'Provider error' },
        ]}
        onReconnect={onReconnect}
      />,
    );
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reconnect' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Manage Google' }));
    expect(screen.getByRole('menuitem', { name: 'Reconnect' })).toBeEnabled();
    expect(screen.getByText('Provider error')).toBeInTheDocument();
    expect(screen.getAllByRole('alert').some(alert => alert.textContent?.includes('Reconnection failed'))).toBe(true);
    expect(screen.queryByRole('button', { name: 'Manage Other' })).not.toBeInTheDocument();
  });
});
