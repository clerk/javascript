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
        activeOrganization={null}
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

describe('UserButtonView, combined mode priority', () => {
  function renderCombined(props: Partial<UserButtonProps> = {}) {
    return renderView({
      mode: 'combined',
      hasOrganizations: true,
      memberships: [foundry],
      activeOrganization: foundry,
      onManageAccount: vi.fn(),
      onManageOrganization: vi.fn(),
      ...props,
    });
  }

  it('heads the surface with the active organization by default', () => {
    renderCombined();

    // The subtitle is the header's alone; the row below it carries only a title.
    expect(screen.getByText('24 members · Pro')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage organization' })).toBeInTheDocument();
  });

  it('heads the surface with the account where the user takes priority', () => {
    renderCombined({ modePriority: 'user' });

    expect(screen.queryByText('24 members · Pro')).toBeNull();
    expect(screen.getByRole('button', { name: 'Manage account' })).toBeInTheDocument();
  });
});

describe('UserButtonTrigger', () => {
  // Closed, so the only "Foundry" or "Alice Smith" on screen is the trigger's own label.
  function renderTrigger(props: Partial<UserButtonProps> = {}) {
    return renderView({
      defaultOpen: false,
      hasOrganizations: true,
      memberships: [foundry],
      activeOrganization: foundry,
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

  it('names the active organization in combined mode', () => {
    renderTrigger({ mode: 'combined' });

    expect(screen.getByText('Foundry')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('names the account in combined mode where the user takes priority', () => {
    renderTrigger({ mode: 'combined', modePriority: 'user' });

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.queryByText('Pro')).toBeNull();
  });

  it('keeps the name when only the plan badge is off', () => {
    renderTrigger({ mode: 'orgs', renderPlanBadge: false });

    expect(screen.getByText('Foundry')).toBeInTheDocument();
    expect(screen.queryByText('Pro')).toBeNull();
  });

  // The corner follows the workspace mark, so a labelled trigger is a pill for a person and a
  // squared-off block for an organization rather than a pill either way.
  it('takes its corner from the workspace it names, labelled or not', () => {
    const corner = (props: Partial<UserButtonProps>) => {
      const { unmount } = renderTrigger(props);
      const className = screen.getByRole('button', { name: /Open account menu/ }).className;
      unmount();
      return className;
    };

    expect(corner({ mode: 'orgs' })).not.toEqual(corner({ mode: 'user' }));
    expect(corner({ mode: 'orgs', renderTriggerLabel: false })).not.toEqual(
      corner({ mode: 'user', renderTriggerLabel: false }),
    );
  });

  // The active organization arrives on its own, ahead of the list it belongs to.
  it('names the active organization before its membership list has loaded', () => {
    renderTrigger({ mode: 'orgs', memberships: [], hasOrganizations: false, organizationsLoading: true });

    expect(screen.getByText('Foundry')).toBeInTheDocument();
    expect(screen.queryByText('Alice Smith')).toBeNull();
  });
});

describe('UserButtonView, loading the organization list', () => {
  it('holds the workspace list open while its first page is in flight', () => {
    renderView({ mode: 'combined', hasOrganizations: true, organizationsLoading: true, onManageAccount: vi.fn() });

    expect(screen.getByText('Loading organizations…')).toBeInTheDocument();
    // The account row heads the section and does not wait on the list.
    expect(screen.getByRole('button', { name: 'Actions for alice@example.com' })).toBeInTheDocument();
  });

  // Memberships, invitations and suggestions are three requests that land at three different
  // moments; showing each as it arrives walks the list in in stages.
  it('withholds every row until all three lists have landed, rather than filling in as they arrive', () => {
    renderView({
      mode: 'combined',
      hasOrganizations: true,
      organizationsLoading: true,
      memberships: [foundry],
      invitations: [
        { kind: 'invitation', id: 'inv_1', organizationId: 'org_2', organizationName: 'Gamma', status: 'pending' },
      ],
      onSelectOrganization: vi.fn(),
      onAcceptInvitation: vi.fn(),
    });

    expect(screen.getByText('Loading organizations…')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Foundry' })).toBeNull();
    expect(screen.queryByText('Gamma')).toBeNull();
  });

  it('drops the loading row once the list has landed', () => {
    renderView({
      mode: 'combined',
      hasOrganizations: true,
      memberships: [foundry],
      activeOrganization: foundry,
      onSelectOrganization: vi.fn(),
    });

    expect(screen.queryByText('Loading organizations…')).toBeNull();
    // Named by the trigger and the header, and listed as the active row.
    expect(screen.getAllByText('Foundry')).toHaveLength(3);
  });

  // An account with no organizations at all has no section, loading or not.
  it('leaves the account-only surface alone', () => {
    renderView({ mode: 'user', organizationsLoading: true });

    expect(screen.queryByText('Loading organizations…')).toBeNull();
  });

  // `hasOrganizations` is known before the lists are fetched, so an account that has none never
  // shows a section that then vanishes under it.
  it('keeps the section out of a surface with nothing to list, even while the lists load', () => {
    renderView({ mode: 'combined', hasOrganizations: false, organizationsLoading: true, onManageAccount: vi.fn() });

    expect(screen.queryByText('Loading organizations…')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Actions for alice@example.com' })).toBeNull();
  });
});

describe('UserButtonView, accepted invitations', () => {
  const gamma = {
    kind: 'invitation',
    id: 'inv_1',
    organizationId: 'org_2',
    organizationName: 'Gamma',
    status: 'accepted',
  } as const;

  function renderInvitations(props: Partial<UserButtonProps> = {}) {
    return renderView({
      mode: 'combined',
      hasOrganizations: true,
      memberships: [foundry],
      activeOrganization: foundry,
      invitations: [gamma],
      onSelectOrganization: vi.fn(),
      onAcceptInvitation: vi.fn(),
      ...props,
    });
  }

  it('lists an accepted invitation as a workspace to switch to, with nothing left to accept', async () => {
    const onSelectOrganization = vi.fn();
    renderInvitations({ onSelectOrganization });

    expect(screen.queryByRole('button', { name: 'Accept' })).toBeNull();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Gamma' }));

    expect(onSelectOrganization).toHaveBeenCalledWith('org_2');
  });

  it('still offers to accept a pending one', () => {
    renderInvitations({ invitations: [{ ...gamma, status: 'pending' }] });

    expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument();
  });

  // The membership list catches up a moment after the accept, and for that moment the organization
  // is in both lists.
  it('drops an accepted invitation the membership list has caught up with', () => {
    renderInvitations({
      memberships: [foundry, { kind: 'membership', organizationId: 'org_2', name: 'Gamma' }],
    });

    // The membership row alone, not it and an invitation row saying the same thing.
    expect(screen.getAllByRole('button', { name: 'Gamma' })).toHaveLength(1);
  });

  it('drops one for the organization that is already active', () => {
    renderInvitations({
      activeOrganization: { kind: 'membership', organizationId: 'org_2', name: 'Gamma' },
      memberships: [foundry],
    });

    // The header names it; the list does not offer to switch to what is already active.
    expect(screen.queryByRole('button', { name: 'Gamma' })).toBeNull();
  });
});
