import { render, screen } from '@testing-library/react';
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

  it('does not offer removal for a protected account', async () => {
    const user = userEvent.setup();
    render(
      <UserProfileConnectedAccountsSectionView
        accounts={[{ ...account, canRemove: false, status: 'reconnect' }]}
        onRemove={vi.fn()}
        onReconnect={vi.fn()}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Manage Google' }));
    expect(screen.getByRole('menuitem', { name: 'Reconnect' })).toBeEnabled();
    expect(screen.queryByRole('menuitem', { name: 'Remove' })).not.toBeInTheDocument();
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
