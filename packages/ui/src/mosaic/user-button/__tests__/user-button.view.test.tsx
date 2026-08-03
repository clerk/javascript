import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import type { UserButtonProps } from '../user-button.view';
import { userButtonBusyKeys, UserButtonView } from '../user-button.view';

// The connected integration test only ever renders `combined`, since the container does not expose
// `mode`. These drive the view directly to cover what each mode rearranges.

const alice = { sessionId: 'sess_1', name: 'Alice Smith', email: 'alice@example.com' };
const bob = { sessionId: 'sess_2', name: 'Bob Jones', email: 'bob@example.com' };

function renderView(props: Partial<UserButtonProps> = {}) {
  return render(
    <MosaicProvider>
      <UserButtonView
        mode='user'
        defaultOpen
        activeSession={alice}
        activeOrganizationId={null}
        hasOrganizations={false}
        memberships={[]}
        suggestions={[]}
        invitations={[]}
        additionalSessions={[bob]}
        {...props}
      />
    </MosaicProvider>,
  );
}

describe('UserButtonView, user mode', () => {
  it('carries "Add account" at the foot of the surface rather than in an account menu', () => {
    renderView({ onAddAccount: vi.fn() });

    expect(screen.getByRole('button', { name: 'Add account' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Account actions' })).toBeNull();
  });

  it('lists the accounts with no heading above them', () => {
    renderView({ onAddAccount: vi.fn(), onSwitchSession: vi.fn() });

    expect(screen.getByRole('button', { name: 'bob@example.com' })).toBeInTheDocument();
    expect(screen.queryByText('Accounts')).toBeNull();
  });

  it('lists the active account too, checked rather than offered to switch to', () => {
    renderView({ onSwitchSession: vi.fn() });

    // Once as the header's subtitle, once as its own row in the list below.
    expect(screen.getAllByText('alice@example.com')).toHaveLength(2);
    expect(screen.queryByRole('button', { name: 'alice@example.com' })).toBeNull();
  });

  it('signs out of the active account from the header, beside the gear', async () => {
    const onSignOutSession = vi.fn();
    renderView({ onManageAccount: vi.fn(), onSignOutSession });

    expect(screen.getByRole('button', { name: 'Manage account' })).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Sign out' }));

    expect(onSignOutSession).toHaveBeenCalledWith('sess_1');
  });

  it('spins the header sign-out while it is in flight', () => {
    renderView({ onSignOutSession: vi.fn(), pendingKey: userButtonBusyKeys.signOutSession('sess_1') });

    const button = screen.getByRole('button', { name: 'Sign out' });
    expect(button).toBeDisabled();
    expect(button.querySelector('.cl-spinner')).not.toBeNull();
  });

  it('omits the header sign-out where the account row already carries one', () => {
    renderView({ mode: 'combined', hasOrganizations: true, onSignOutSession: vi.fn() });

    expect(screen.getByRole('button', { name: 'Actions for alice@example.com' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sign out' })).toBeNull();
  });

  it('keeps "Add account" in the Accounts heading where the surface lists organizations', () => {
    renderView({ mode: 'combined', hasOrganizations: true, onAddAccount: vi.fn() });

    expect(screen.getByText('Accounts')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Account actions' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add account' })).toBeNull();
  });
});
