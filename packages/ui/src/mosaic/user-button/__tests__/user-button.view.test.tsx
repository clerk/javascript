import * as stylex from '@stylexjs/stylex';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { scrollAreaViewport } from '../../components/scroll-area';
import { MosaicProvider } from '../../MosaicProvider';
import type { UserButtonProps } from '../user-button.view';
import { userButtonBusyKeys, UserButtonView } from '../user-button.view';

// The connected UserButton only ever renders `combined` — the container does not expose `mode` — so
// this is the only place the three surfaces can be told apart. One describe per mode covers what
// each carries and withholds; the describes after them cover what the modes share.

const alice = { sessionId: 'sess_1', name: 'Alice Smith', email: 'alice@example.com' };
const bob = { sessionId: 'sess_2', name: 'Bob Jones', email: 'bob@example.com' };

const foundry = {
  kind: 'membership',
  organizationId: 'org_1',
  name: 'Foundry',
  membersCount: 24,
  planLabel: 'Pro',
} as const;

const otherCo = { kind: 'membership', organizationId: 'org_2', name: 'Other Co' } as const;

const gamma = {
  kind: 'invitation',
  id: 'inv_1',
  organizationId: 'org_3',
  organizationName: 'Gamma',
  status: 'pending',
} as const;

const beta = { kind: 'suggestion', id: 'sug_1', organizationId: 'org_4', name: 'Beta', status: 'pending' } as const;

/**
 * Every callback the connected container passes, so a test opts a surface *out* of an affordance
 * rather than having to opt into it. `combined` is the container's own default.
 */
function renderView(props: Partial<UserButtonProps> = {}) {
  return render(
    <MosaicProvider>
      <UserButtonView
        mode='combined'
        defaultOpen
        activeSession={alice}
        activeOrganization={null}
        hasOrganizations={false}
        memberships={[]}
        suggestions={[]}
        invitations={[]}
        additionalSessions={[bob]}
        onSelectOrganization={vi.fn()}
        onSwitchSession={vi.fn()}
        onSignOutSession={vi.fn()}
        onSignOutAll={vi.fn()}
        onAcceptInvitation={vi.fn()}
        onAcceptSuggestion={vi.fn()}
        onManageAccount={vi.fn()}
        onManageOrganization={vi.fn()}
        onInviteMembers={vi.fn()}
        onCreateOrganization={vi.fn()}
        onAddAccount={vi.fn()}
        {...props}
      />
    </MosaicProvider>,
  );
}

const popup = () => screen.getByRole('dialog', { name: 'Account' });

// The `cl-` slot classes are Mosaic's public theming hooks, so they are a stable handle on the
// popup's sections rather than an implementation detail.
const groups = () => Array.from(popup().querySelectorAll<HTMLElement>('.cl-item-group'));
const titles = (group: HTMLElement | undefined) =>
  Array.from(group?.querySelectorAll('.cl-item-title') ?? []).map(node => node.textContent ?? '');

const scrollClasses = stylex.props(...scrollAreaViewport('auto')).className?.split(' ') ?? [];

/** The workspace list: the one group in the popup that scrolls. */
const workspaceList = () => groups().find(group => scrollClasses.every(name => group.classList.contains(name)));

/** The accounts group: the one whose rows are titled by email rather than by workspace name. */
const accountsList = () =>
  groups().find(group => group !== workspaceList() && titles(group).some(title => title.includes('@')));

// `user` is an account switcher that never shows an organization, even when one is active.
describe('UserButtonView, user mode', () => {
  function renderUserMode(props: Partial<UserButtonProps> = {}) {
    return renderView({
      mode: 'user',
      // All of this is the organization side, and is here to prove the surface ignores it.
      hasOrganizations: true,
      activeOrganization: foundry,
      memberships: [foundry, otherCo],
      invitations: [gamma],
      ...props,
    });
  }

  it('names the account in the header, never the organization that is active', () => {
    renderUserMode();

    const header = groups()[0];
    expect(within(header).getByText('Alice Smith')).toBeInTheDocument();
    expect(within(header).getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.queryByText('Foundry')).toBeNull();
  });

  it('lists no workspaces at all', () => {
    renderUserMode();

    expect(workspaceList()).toBeUndefined();
    expect(screen.queryByText('Personal account')).toBeNull();
    expect(screen.queryByText('Gamma')).toBeNull();
  });

  // Every other surface hangs "Sign out" off the account's own row; this one has no such row, so it
  // takes the labelled slot beside the gear. Inviting belongs to an organization, which is not what
  // this surface is about.
  it('signs out of the account from the header, beside the gear', async () => {
    const onSignOutSession = vi.fn();
    renderUserMode({ onSignOutSession });

    expect(screen.getByRole('button', { name: 'Manage account' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Invite' })).toBeNull();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Sign out' }));

    expect(onSignOutSession).toHaveBeenCalledWith('sess_1');
  });

  it('spins the header sign-out while it is in flight', () => {
    renderUserMode({ pendingKey: userButtonBusyKeys.signOutSession('sess_1') });

    const button = screen.getByRole('button', { name: 'Sign out' });
    expect(button).toBeDisabled();
    expect(button.querySelector('.cl-spinner')).not.toBeNull();
  });

  // With nothing above them to be told apart from, the account rows stand alone: no heading, and
  // the account you are already on is not somewhere else to go.
  it('lists only the accounts to switch to, with no heading above them', () => {
    renderUserMode();

    expect(titles(accountsList())).toEqual(['bob@example.com']);
    expect(screen.queryByText('Accounts')).toBeNull();
  });

  it('takes "Add account" at the foot rather than into an account menu', () => {
    renderUserMode();

    expect(screen.getByRole('button', { name: 'Add account' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Account actions' })).toBeNull();
  });
});

// `orgs` is an organization switcher with no account rows at all.
describe('UserButtonView, orgs mode', () => {
  function renderOrgsMode(props: Partial<UserButtonProps> = {}) {
    return renderView({
      mode: 'orgs',
      hasOrganizations: true,
      activeOrganization: foundry,
      memberships: [foundry, otherCo],
      ...props,
    });
  }

  it('heads the surface with the active organization and what can be done to it', () => {
    renderOrgsMode();

    const header = groups()[0];
    expect(within(header).getByText('Foundry')).toBeInTheDocument();
    expect(within(header).getByText('24 members · Pro')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Invite' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage organization' })).toBeInTheDocument();
  });

  // The account is all there is to head it with, and it is not an organization, so there is nobody
  // to invite and the gear manages the account instead.
  it('falls back to the account in the header where no organization is active', () => {
    renderOrgsMode({ activeOrganization: null });

    expect(within(groups()[0]).getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage account' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Invite' })).toBeNull();
  });

  it('lists the workspaces, the personal one among them', () => {
    renderOrgsMode();

    expect(titles(workspaceList())).toEqual(['Personal account', 'Foundry', 'Other Co']);
  });

  it('carries no account rows, not even the one it belongs to', () => {
    renderOrgsMode();

    expect(accountsList()).toBeUndefined();
    expect(screen.queryByText('Accounts')).toBeNull();
    expect(screen.queryByRole('button', { name: 'bob@example.com' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Actions for alice@example.com' })).toBeNull();
  });

  // No account menu to carry "Create organization", so it lands at the foot, in the slot the
  // account-wide actions occupy elsewhere. Those actions themselves have no place here.
  it('takes "Create organization" at the foot, in place of the account actions', () => {
    renderOrgsMode();

    expect(screen.getByRole('button', { name: 'Create organization' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add account' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Sign out of all accounts' })).toBeNull();
  });
});

// `combined` is both switchers at once, so it is the only surface that has to decide which one
// leads and where the account-wide actions live.
describe('UserButtonView, combined mode', () => {
  function renderCombined(props: Partial<UserButtonProps> = {}) {
    return renderView({
      hasOrganizations: true,
      activeOrganization: foundry,
      memberships: [foundry, otherCo],
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

  // The row heads the workspaces that belong to the account, the way the "Accounts" heading heads
  // the other accounts, and carries the account-wide actions the header has no room for.
  it('heads the workspace list with the active account and its own actions', async () => {
    const onSignOutSession = vi.fn();
    const act = userEvent.setup();
    renderCombined({ onSignOutSession });

    await act.click(screen.getByRole('button', { name: 'Actions for alice@example.com' }));

    expect(await screen.findByRole('menuitem', { name: 'Manage account' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Create organization' })).toBeInTheDocument();
    await act.click(screen.getByRole('menuitem', { name: 'Sign out' }));

    expect(onSignOutSession).toHaveBeenCalledWith('sess_1');
  });

  it('keeps the header sign-out off, since the account row carries it', () => {
    renderCombined();

    expect(screen.queryByRole('button', { name: 'Sign out' })).toBeNull();
  });

  // Under a heading the group reads as the full set of accounts, so the one you are on is listed
  // and checked rather than left out.
  it('heads the other accounts under "Accounts", listing the one it is on', () => {
    renderCombined();

    expect(titles(accountsList())).toEqual(['alice@example.com', 'bob@example.com']);
    expect(screen.getByText('Accounts')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'alice@example.com' })).toBeNull();
  });

  it('keeps "Add account" in the Accounts heading rather than at the foot', async () => {
    renderCombined();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Account actions' }));

    expect(await screen.findByRole('menuitem', { name: 'Add account' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add account' })).toBeNull();
  });

  // One account means no heading to hang it off, so "Add account" falls back to the foot, the same
  // slot the account-only surface carries it in.
  it('takes "Add account" at the foot where there is no heading to carry it', () => {
    renderCombined({ additionalSessions: [] });

    expect(accountsList()).toBeUndefined();
    expect(screen.queryByText('Accounts')).toBeNull();
    expect(screen.getByRole('button', { name: 'Add account' })).toBeInTheDocument();
  });

  // The account row is not the workspace list's to withhold: an account with no organizations still
  // needs somewhere to manage and sign out of the one it is signed in as.
  it('keeps the account row with no organizations to head', () => {
    renderCombined({ hasOrganizations: false, activeOrganization: null, memberships: [] });

    expect(screen.getByRole('button', { name: 'Actions for alice@example.com' })).toBeInTheDocument();
    // The section is there, holding the account row alone.
    expect(workspaceList()).toBeDefined();
    expect(titles(workspaceList())).toEqual([]);
    expect(screen.queryByText('Personal account')).toBeNull();
  });
});

describe('UserButtonView, the workspace list', () => {
  function renderList(props: Partial<UserButtonProps> = {}) {
    return renderView({
      hasOrganizations: true,
      activeOrganization: foundry,
      memberships: [foundry],
      ...props,
    });
  }

  // The order the existing OrganizationSwitcher lists these in: what is on offer leads, since it is
  // the one row that goes away if it is not acted on, and invitations lead the suggestions since
  // accepting one joins where a suggestion only files a request.
  it('leads with the invitations, then the suggestions, then the workspaces held', () => {
    renderList({ invitations: [gamma], suggestions: [beta] });

    expect(titles(workspaceList())).toEqual(['Gamma', 'Beta', 'Personal account', 'Foundry']);
  });

  // The one surface in the popup that scrolls, so it takes the shared scroll area rather than a
  // bare `overflow-y` of its own. `auto` rather than `stable`: a reserved gutter insets the rows
  // whether or not the list overflows, leaving short lists with their avatars and icons off the
  // edge the header and footer align to. Every list assertion here is found through these classes.
  it('scrolls through the shared scroll area, at an automatic gutter', () => {
    renderList();

    expect(scrollClasses.length).toBeGreaterThan(0);
    expect(workspaceList()).toBeDefined();
  });

  it('hands the paging sentinel to the in-view ref only while more pages remain', () => {
    const ref = vi.fn();
    const { unmount } = renderList({ paging: { ref, hasMore: false } });
    expect(ref).not.toHaveBeenCalled();
    unmount();

    renderList({ paging: { ref, hasMore: true } });
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  // Switching into an organization is not a one-way door: the account's own workspace is listed
  // alongside the organizations, so there is always a way back out of one.
  describe('the personal workspace', () => {
    it('switches back out of the active organization', async () => {
      const onSelectOrganization = vi.fn();
      renderList({ onSelectOrganization });

      await userEvent.setup().click(screen.getByRole('button', { name: 'Personal account' }));

      expect(onSelectOrganization).toHaveBeenCalledWith(null);
    });

    // Named for what it is among organizations rather than for the account, the way the existing
    // OrganizationSwitcher names it. The trigger and header still name the account itself.
    it('names it "Personal account" rather than repeating the account', () => {
      renderList();

      expect(titles(workspaceList())).toContain('Personal account');
      expect(titles(workspaceList())).not.toContain('Alice Smith');
    });

    // The same contract every workspace row follows: what is already selected is not a button.
    it('checks it, and offers no switch, where it is what is active', () => {
      renderList({ activeOrganization: null });

      expect(screen.getByText('Personal account')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Personal account' })).toBeNull();
    });

    it('spins it while the switch is in flight', () => {
      renderList({ pendingKey: userButtonBusyKeys.selectOrganization(null) });

      const row = screen.getByRole('button', { name: 'Personal account' });
      expect(row).toBeDisabled();
      expect(row.querySelector('.cl-spinner')).not.toBeNull();
    });

    // An instance that requires an organization has no personal workspace to return to, so the row
    // would stand there and do nothing. It is withheld rather than stood down: this is not a moment
    // where the switch is unavailable, it is a surface where the workspace does not exist.
    it('stays out of a surface that has no personal workspace', () => {
      renderList({ hidePersonal: true, memberships: [foundry, otherCo] });

      expect(screen.queryByText('Personal account')).toBeNull();
      // The organizations are still listed; it is only the way back out of them that is gone.
      expect(titles(workspaceList())).toEqual(['Foundry', 'Other Co']);
    });
  });

  describe('the rows on offer', () => {
    it('offers to accept an invitation and to join a suggestion', () => {
      renderList({ invitations: [gamma], suggestions: [beta] });

      expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Join' })).toBeInTheDocument();
    });

    // A pending row has to be reachable before there is a membership, or an account holding nothing
    // but an invitation would open onto a surface with no way to accept it.
    it('lists them with no memberships to list them beside', () => {
      renderList({ hasOrganizations: false, activeOrganization: null, memberships: [], invitations: [gamma] });

      expect(titles(workspaceList())).toEqual(['Gamma', 'Personal account']);
      expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument();
    });

    // An accepted suggestion is waiting on an admin, so it reports rather than re-offers.
    it('reports an accepted suggestion instead of offering to join it again', () => {
      renderList({ suggestions: [{ ...beta, status: 'accepted' }] });

      expect(screen.queryByRole('button', { name: 'Join' })).toBeNull();
      expect(screen.getByText('Requested')).toBeInTheDocument();
    });

    // Accepting an invitation joins the organization, so an accepted one is a workspace like any
    // other: click the row to switch to it.
    it('lists an accepted invitation as a workspace to switch to', async () => {
      const onSelectOrganization = vi.fn();
      renderList({ invitations: [{ ...gamma, status: 'accepted' }], onSelectOrganization });

      expect(screen.queryByRole('button', { name: 'Accept' })).toBeNull();
      await userEvent.setup().click(screen.getByRole('button', { name: 'Gamma' }));

      expect(onSelectOrganization).toHaveBeenCalledWith('org_3');
    });

    // The membership list catches up a moment after the accept, and for that moment the
    // organization is in both lists.
    it('drops an accepted invitation the membership list has caught up with', () => {
      renderList({
        invitations: [{ ...gamma, status: 'accepted' }],
        memberships: [foundry, { kind: 'membership', organizationId: 'org_3', name: 'Gamma' }],
      });

      expect(titles(workspaceList())).toEqual(['Personal account', 'Foundry', 'Gamma']);
    });

    it('drops one for the organization that is already active', () => {
      renderList({
        invitations: [{ ...gamma, status: 'accepted' }],
        activeOrganization: { kind: 'membership', organizationId: 'org_3', name: 'Gamma' },
      });

      // The header names it; the list does not offer to switch to what is already active.
      expect(screen.queryByRole('button', { name: 'Gamma' })).toBeNull();
    });
  });

  // Memberships, invitations and suggestions are three requests that land at three different
  // moments; showing each as it arrives walks the list in in stages.
  describe('while its first page is in flight', () => {
    it('withholds every row behind one placeholder', () => {
      renderList({ organizationsLoading: true, invitations: [gamma] });

      expect(screen.getByText('Loading organizations…')).toBeInTheDocument();
      expect(workspaceList()).toBeDefined();
      expect(titles(workspaceList())).toEqual([]);
    });

    it('leaves the account row above it alone, since it does not wait on the list', () => {
      renderList({ organizationsLoading: true });

      expect(screen.getByRole('button', { name: 'Actions for alice@example.com' })).toBeInTheDocument();
    });

    it('drops the placeholder once the list has landed', () => {
      renderList();

      expect(screen.queryByText('Loading organizations…')).toBeNull();
      expect(titles(workspaceList())).toEqual(['Personal account', 'Foundry']);
    });

    // `hasOrganizations` is answered before the lists are fetched, so an account with none never
    // opens a section that then disappears under it.
    it('stays out of a surface with nothing to list', () => {
      renderList({ hasOrganizations: false, activeOrganization: null, memberships: [], organizationsLoading: true });

      expect(screen.queryByText('Loading organizations…')).toBeNull();
    });
  });
});

// Rows carry avatars, and an avatar's load state dies with the element it hangs off. Swapping a
// row's host element out while it waits would remount it, dropping the avatar back to its initials
// for the length of the action — so a row that stands down stays the button it was.
describe('UserButtonView, one action at a time', () => {
  function surface(pendingKey: string | null) {
    return (
      <MosaicProvider>
        <UserButtonView
          mode='combined'
          defaultOpen
          activeSession={alice}
          activeOrganization={foundry}
          hasOrganizations
          memberships={[foundry, otherCo]}
          suggestions={[]}
          invitations={[]}
          additionalSessions={[bob]}
          pendingKey={pendingKey}
          onSelectOrganization={vi.fn()}
          onSwitchSession={vi.fn()}
          onSignOutAll={vi.fn()}
          onManageAccount={vi.fn()}
          onSignOutSession={vi.fn()}
        />
      </MosaicProvider>
    );
  }

  it.each([
    ['a workspace row', 'Other Co'],
    ['the personal row', 'Personal account'],
    ['an account row', 'bob@example.com'],
    ['an action row', 'Sign out of all accounts'],
    // The `⋯` stands down the same way. Withholding what it opens would unmount the trigger, so
    // the row would drop its trailing edge for the length of the action and get it back after.
    ['the account menu', 'Actions for alice@example.com'],
  ])('holds %s in place, disabled, while another action runs', (_name, label) => {
    const { rerender } = render(surface(null));
    const row = screen.getByRole('button', { name: label });

    rerender(surface(userButtonBusyKeys.switchSession('sess_9')));

    const stoodDown = screen.getByRole('button', { name: label });
    expect(stoodDown).toBe(row);
    expect(stoodDown).toBeDisabled();
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
