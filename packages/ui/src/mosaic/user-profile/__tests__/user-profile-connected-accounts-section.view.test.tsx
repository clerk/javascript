import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { UserProfileConnectedAccountsSectionView } from '../user-profile-connected-accounts-section.view';

const account = { id: 'account_1', provider: 'Google', identifier: 'test@example.com' };

describe('connected accounts section', () => {
  it('keeps connect options separate from account rows and reflects pending state', async () => {
    const user = userEvent.setup();
    const onConnect = vi.fn();
    const availableProviders = [
      { id: 'apple', provider: 'Apple' },
      { id: 'github', provider: 'GitHub' },
    ];
    const { rerender } = render(
      <UserProfileConnectedAccountsSectionView
        accounts={[]}
        availableProviders={availableProviders}
        onConnect={onConnect}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Connect account' }));
    await user.click(screen.getByRole('menuitem', { name: 'Apple' }));
    expect(onConnect).toHaveBeenCalledExactlyOnceWith('apple');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    rerender(
      <UserProfileConnectedAccountsSectionView
        accounts={[]}
        availableProviders={availableProviders}
        onConnect={onConnect}
        connectingProviderId='apple'
      />,
    );
    expect(screen.getByRole('menuitem', { name: 'Apple' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('menuitem', { name: 'GitHub' })).toHaveAttribute('aria-disabled', 'true');
    await user.click(screen.getByRole('menuitem', { name: 'GitHub' }));
    expect(onConnect).toHaveBeenCalledTimes(1);
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
    expect(within(dialog).getByRole('button', { name: 'Remove', exact: true })).toBeDisabled();
    rerender(
      <UserProfileConnectedAccountsSectionView
        accounts={[{ ...account, removalError: 'Try again' }]}
        onRemove={onRemove}
      />,
    );
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Try again');
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
          { ...account, status: 'reconnect' },
          { id: 'other', provider: 'Other', status: 'error', verificationError: 'Provider error' },
        ]}
        onReconnect={onReconnect}
        errorMessage='Connection failed'
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Reconnect' }));
    expect(onReconnect).toHaveBeenCalledExactlyOnceWith('account_1');
    expect(screen.getByText('Provider error')).toBeInTheDocument();
    expect(screen.getAllByRole('alert').some(alert => alert.textContent?.includes('Connection failed'))).toBe(true);
    expect(screen.queryByRole('button', { name: 'Manage Google' })).not.toBeInTheDocument();
  });
});
