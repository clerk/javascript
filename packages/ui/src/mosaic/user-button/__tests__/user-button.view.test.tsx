import * as stylex from '@stylexjs/stylex';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { scrollAreaViewport } from '../../components/scroll-area';
import { MosaicProvider } from '../../MosaicProvider';
import type { UserButtonProps } from '../user-button.view';
import { userButtonBusyKeys, UserButtonView } from '../user-button.view';

// `mode` is the view's own prop, so what each of the three surfaces carries and withholds is settled
// here. One describe per mode; the describes after them cover what the modes share.

const alice = { sessionId: 'sess_1', name: 'Alice Smith', identifier: 'alice@example.com' };
const bob = { sessionId: 'sess_2', name: 'Bob Jones', identifier: 'bob@example.com' };

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
const row = (group: HTMLElement | undefined, title: string) =>
  Array.from(group?.querySelectorAll<HTMLElement>('.cl-item') ?? []).find(
    node => node.querySelector('.cl-item-title')?.textContent === title,
  );

const scrollClasses = stylex.props(...scrollAreaViewport('auto')).className?.split(' ') ?? [];

/** The workspace list: the one group in the popup that scrolls. */
const workspaceList = () => groups().find(group => scrollClasses.every(name => group.classList.contains(name)));

/** The accounts group: the one whose rows are titled by identifier rather than by workspace name. */
const accountsList = () =>
  groups().find(group => group !== workspaceList() && titles(group).some(title => title.includes('@')));

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

  it('drops the identifier line when it would only repeat the title', () => {
    renderUserMode({ activeSession: { ...alice, name: 'alice@example.com' } });

    const header = groups()[0];
    expect(within(header).getAllByText('alice@example.com')).toHaveLength(1);
  });

  it('lists no workspaces at all', () => {
    renderUserMode();

    expect(workspaceList()).toBeUndefined();
    expect(screen.queryByText('Personal account')).toBeNull();
    expect(screen.queryByText('Gamma')).toBeNull();
  });

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

describe('UserButtonView, organization mode', () => {
  function renderOrganizationMode(props: Partial<UserButtonProps> = {}) {
    return renderView({
      mode: 'organization',
      hasOrganizations: true,
      activeOrganization: foundry,
      memberships: [foundry, otherCo],
      ...props,
    });
  }

  it('heads the surface with the active organization and what can be done to it', () => {
    renderOrganizationMode();

    const header = groups()[0];
    expect(within(header).getByText('Foundry')).toBeInTheDocument();
    expect(within(header).getByText('24 members · Pro')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Invite' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage organization' })).toBeInTheDocument();
  });

  it('falls back to the account in the header where no organization is active', () => {
    renderOrganizationMode({ activeOrganization: null });

    expect(within(groups()[0]).getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage account' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Invite' })).toBeNull();
  });

  it('lists the workspaces, the personal one among them', () => {
    renderOrganizationMode();

    expect(titles(workspaceList())).toEqual(['Personal account', 'Foundry', 'Other Co']);
  });

  it('carries no account rows, not even the one it belongs to', () => {
    renderOrganizationMode();

    expect(accountsList()).toBeUndefined();
    expect(screen.queryByText('Accounts')).toBeNull();
    expect(screen.queryByRole('button', { name: 'bob@example.com' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Actions for alice@example.com' })).toBeNull();
  });

  it('takes "Create organization" at the foot, in place of the account actions', () => {
    renderOrganizationMode();

    expect(screen.getByRole('button', { name: 'Create organization' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add account' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Sign out of all accounts' })).toBeNull();
  });
});

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

  it('heads the other accounts under "Accounts", listing the one it is on', () => {
    renderCombined();

    expect(titles(accountsList())).toEqual(['alice@example.com', 'bob@example.com']);
    expect(screen.getByText('Accounts')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'alice@example.com' })).toBeNull();
  });

  it('names the account it is on as the current one', () => {
    renderCombined();

    expect(row(accountsList(), 'alice@example.com')).toHaveAttribute('aria-current', 'true');
    expect(row(accountsList(), 'bob@example.com')).not.toHaveAttribute('aria-current');
  });

  it('keeps "Add account" in the Accounts heading rather than at the foot', async () => {
    renderCombined();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Account actions' }));

    expect(await screen.findByRole('menuitem', { name: 'Add account' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add account' })).toBeNull();
  });

  it('takes "Add account" at the foot where there is no heading to carry it', () => {
    renderCombined({ additionalSessions: [] });

    expect(accountsList()).toBeUndefined();
    expect(screen.queryByText('Accounts')).toBeNull();
    expect(screen.getByRole('button', { name: 'Add account' })).toBeInTheDocument();
  });

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

  // Accepting an invitation joins; a suggestion only files a request, so invitations lead.
  it('leads with the invitations, then the suggestions, then the workspaces held', () => {
    renderList({ invitations: [gamma], suggestions: [beta] });

    expect(titles(workspaceList())).toEqual(['Gamma', 'Beta', 'Personal account', 'Foundry']);
  });

  // `auto` rather than `stable`: a reserved gutter would inset short lists off the edge the header
  // and footer align to.
  it('scrolls through the shared scroll area, at an automatic gutter', () => {
    renderList();

    expect(scrollClasses.length).toBeGreaterThan(0);
    expect(workspaceList()).toBeDefined();
  });

  // The check beside the active row is decorative, so on its own it leaves that row reading to a
  // screen reader exactly like the ones there is still somewhere to switch to.
  it('names the active workspace as the current one', () => {
    renderList({ memberships: [foundry, otherCo] });

    expect(row(workspaceList(), 'Foundry')).toHaveAttribute('aria-current', 'true');
    expect(row(workspaceList(), 'Other Co')).not.toHaveAttribute('aria-current');
    expect(row(workspaceList(), 'Personal account')).not.toHaveAttribute('aria-current');
  });

  it('names the personal workspace as the current one where no organization is active', () => {
    renderList({ activeOrganization: null });

    expect(row(workspaceList(), 'Personal account')).toHaveAttribute('aria-current', 'true');
    expect(row(workspaceList(), 'Foundry')).not.toHaveAttribute('aria-current');
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

    // Withheld rather than stood down: the workspace does not exist here, so there is no switch to
    // make available later.
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

    // Every other affordance on the surface swaps its icon for a spinner, but these carry a label
    // rather than an icon, so the spinner goes inside the button instead of taking its place.
    it('spins inside the join button rather than replacing it', () => {
      renderList({ suggestions: [beta], pendingKey: userButtonBusyKeys.acceptSuggestion('sug_1') });

      const join = screen.getByRole('button', { name: 'Join' });
      expect(join).toHaveAttribute('aria-busy', 'true');
      expect(within(join).getByRole('progressbar')).toBeInTheDocument();
      // The row itself stays as it was: the button is what reports the action, not the trailing edge.
      expect(row(workspaceList(), 'Beta')?.querySelector('.cl-spinner')).toBe(within(join).getByRole('progressbar'));
    });

    it('spins inside the accept button too', () => {
      renderList({ invitations: [gamma], pendingKey: userButtonBusyKeys.acceptInvitation('inv_1') });

      const accept = screen.getByRole('button', { name: 'Accept' });
      expect(accept).toHaveAttribute('aria-busy', 'true');
      expect(within(accept).getByRole('progressbar')).toBeInTheDocument();
    });

    it('reports an accepted suggestion instead of offering to join it again', () => {
      renderList({ suggestions: [{ ...beta, status: 'accepted' }] });

      expect(screen.queryByRole('button', { name: 'Join' })).toBeNull();
      expect(screen.getByText('Requested')).toBeInTheDocument();
    });

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

// The foot is the one flat list of actions the surface has; everything else lives in the header or
// behind a `⋯`. So it is where an app's own actions land, and the only list an order can run in.
describe('UserButtonView, the foot', () => {
  const terms = { id: 'terms', label: 'Terms of service' };
  const support = { id: 'support', label: 'Support', href: '/support' };

  const action = () => ({ ...terms, onClick: vi.fn() });

  /** The foot's rows, in the order it lists them. It is the last group in the popup. */
  const footLabels = () =>
    Array.from(groups().at(-1)?.querySelectorAll('.cl-item-label') ?? []).map(node => node.textContent ?? '');

  // The order the existing UserButton lists them in, above "Add account".
  it('leads with the custom rows', () => {
    renderView({ customMenuItems: [action(), support] });

    expect(footLabels()).toEqual(['Terms of service', 'Support', 'Sign out of all accounts']);
  });

  it('runs a custom action on press', async () => {
    const item = action();
    renderView({ customMenuItems: [item] });

    await userEvent.setup().click(screen.getByRole('button', { name: 'Terms of service' }));

    expect(item.onClick).toHaveBeenCalled();
  });

  it('renders a custom link as one, pointed where it was told', () => {
    renderView({ customMenuItems: [support] });

    expect(screen.getByRole('link', { name: 'Support' })).toHaveAttribute('href', '/support');
  });

  it('renders the icon a custom row brings', () => {
    renderView({ customMenuItems: [{ ...action(), icon: <svg data-testid='glyph' /> }] });

    expect(screen.getByTestId('glyph')).toBeInTheDocument();
  });

  it('orders the rows by the ids it is given', () => {
    renderView({ customMenuItems: [action(), support], menuItemOrder: ['signOutAll', 'support'] });

    expect(footLabels()).toEqual(['Sign out of all accounts', 'Support', 'Terms of service']);
  });

  // Only some of the built-in actions are rows at all, and which of those a surface carries depends
  // on its mode, so naming one it has not got is ordinary rather than a mistake.
  it('drops an id no row answers to', () => {
    renderView({ customMenuItems: [action()], menuItemOrder: ['manageAccount', 'signOutAll', 'nonsense'] });

    expect(footLabels()).toEqual(['Sign out of all accounts', 'Terms of service']);
  });

  it('orders "Add account" where the foot is what carries it', () => {
    renderView({ additionalSessions: [], customMenuItems: [action()], menuItemOrder: ['addAccount', 'terms'] });

    expect(footLabels()).toEqual(['Add account', 'Terms of service', 'Sign out of all accounts']);
  });

  it('carries the custom rows on an org-only surface too', () => {
    renderView({
      mode: 'organization',
      hasOrganizations: true,
      activeOrganization: foundry,
      customMenuItems: [action()],
    });

    expect(footLabels()).toEqual(['Terms of service', 'Create organization']);
  });

  it('holds a custom action in place, disabled, while another action runs', () => {
    renderView({ customMenuItems: [action()], pendingKey: userButtonBusyKeys.switchSession('sess_9') });

    expect(screen.getByRole('button', { name: 'Terms of service' })).toBeDisabled();
  });

  it('leaves a custom link followable while another action runs', () => {
    renderView({ customMenuItems: [support], pendingKey: userButtonBusyKeys.switchSession('sess_9') });

    expect(screen.getByRole('link', { name: 'Support' })).toHaveAttribute('href', '/support');
  });

  // The logo names the link, so the mark is what a screen reader reaches rather than an unnamed link.
  it('sends the branding logo to Clerk, in a tab of its own', () => {
    renderView();

    const logo = screen.getByRole('link', { name: 'Clerk' });
    expect(logo).toHaveAttribute('href', 'https://go.clerk.com/components');
    expect(logo).toHaveAttribute('target', '_blank');
    expect(logo).toHaveAttribute('rel', 'noopener noreferrer');
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
    renderTrigger({ mode: 'organization' });

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
    renderTrigger({ mode: 'organization', renderTriggerLabel: false });

    expect(screen.queryByText('Foundry')).toBeNull();
    expect(screen.queryByText('Pro')).toBeNull();
    expect(screen.getByRole('button', { name: 'Open account menu for Foundry' })).toBeInTheDocument();
  });

  it('keeps the name when only the plan badge is off', () => {
    renderTrigger({ mode: 'organization', renderPlanBadge: false });

    expect(screen.getByText('Foundry')).toBeInTheDocument();
    expect(screen.queryByText('Pro')).toBeNull();
  });

  it('takes its corner from the workspace it names, labelled or not', () => {
    const corner = (props: Partial<UserButtonProps>) => {
      const { unmount } = renderTrigger(props);
      const className = screen.getByRole('button', { name: /Open account menu/ }).className;
      unmount();
      return className;
    };

    expect(corner({ mode: 'organization' })).not.toEqual(corner({ mode: 'user' }));
    expect(corner({ mode: 'organization', renderTriggerLabel: false })).not.toEqual(
      corner({ mode: 'user', renderTriggerLabel: false }),
    );
  });

  it('names the active organization before its membership list has loaded', () => {
    renderTrigger({ mode: 'organization', memberships: [], hasOrganizations: false, organizationsLoading: true });

    expect(screen.getByText('Foundry')).toBeInTheDocument();
    expect(screen.queryByText('Alice Smith')).toBeNull();
  });
});
