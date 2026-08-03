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

const foundry = {
  kind: 'membership',
  organizationId: 'org_1',
  name: 'Foundry',
  membersCount: 24,
  planLabel: 'Pro',
} as const;

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

  it('lists only the accounts to switch to, with no heading above them', () => {
    renderView({ onAddAccount: vi.fn(), onSwitchSession: vi.fn() });

    expect(screen.getByRole('button', { name: 'bob@example.com' })).toBeInTheDocument();
    expect(screen.queryByText('Accounts')).toBeNull();
    // The header's subtitle and nothing else: the active account is not repeated in the list.
    expect(screen.getAllByText('alice@example.com')).toHaveLength(1);
  });

  it('lists the active account under the heading, not offered to switch to', () => {
    renderView({ mode: 'combined', hasOrganizations: true, onSwitchSession: vi.fn() });

    // The header's subtitle, the row heading its workspaces, and its row in the accounts group.
    expect(screen.getAllByText('alice@example.com')).toHaveLength(3);
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

describe('UserButtonTrigger', () => {
  // Closed, so the only "Foundry" or "Alice Smith" on screen is the trigger's own label.
  function renderTrigger(props: Partial<UserButtonProps> = {}) {
    return renderView({
      defaultOpen: false,
      hasOrganizations: true,
      memberships: [foundry],
      activeOrganizationId: 'org_1',
      ...props,
    });
  }

  it('names the active organization and its plan', () => {
    renderTrigger({ mode: 'orgs' });

    expect(screen.getByText('Foundry')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('names the account where no organization heads the trigger', () => {
    renderTrigger({ mode: 'user' });

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.queryByText('Pro')).toBeNull();
  });

  it('renders the avatar alone when the label is off', () => {
    renderTrigger({ mode: 'orgs', renderTriggerLabel: false });

    expect(screen.queryByText('Foundry')).toBeNull();
    expect(screen.queryByText('Pro')).toBeNull();
    expect(screen.getByRole('button', { name: 'Open account menu for Foundry' })).toBeInTheDocument();
  });

  it('keeps the name when only the plan badge is off', () => {
    renderTrigger({ mode: 'orgs', renderPlanBadge: false });

    expect(screen.getByText('Foundry')).toBeInTheDocument();
    expect(screen.queryByText('Pro')).toBeNull();
  });
});
