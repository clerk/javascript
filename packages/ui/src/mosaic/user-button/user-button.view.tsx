'use client';

import type { PopoverProps } from '@clerk/headless/popover';
import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import React from 'react';

import type { AvatarProps } from '../components/avatar';
import { Avatar } from '../components/avatar';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Card } from '../components/card';
import { ClerkLogo } from '../components/clerk-logo';
import { Icon } from '../components/icon';
import { Item } from '../components/item';
import { Menu } from '../components/menu';
import { Popover } from '../components/popover';
import { scrollAreaViewport } from '../components/scroll-area';
import { Spinner } from '../components/spinner';
import { truncationStyles } from '../components/typography.styles';
import type { IconName } from '../icons/registry';
import { fontWeightVars } from '../tokens.stylex';
import { styles, triggerShapes } from './user-button.styles';

// ─── Data contract ──────────────────────────────────────────────────────────
// Session-backed, discriminated resource rows. Intended to be 1:1 with a future
// `useUserButtonController()` output so the controller is a drop-in follow-up.

export interface UserButtonSession {
  sessionId: string;
  name: string;
  email: string;
  imageUrl?: string;
}

export interface UserButtonMembership {
  kind: 'membership';
  organizationId: string;
  name: string;
  imageUrl?: string;
  membersCount?: number;
  planLabel?: string;
}

export interface UserButtonSuggestion {
  kind: 'suggestion';
  id: string;
  organizationId: string;
  name: string;
  imageUrl?: string;
  /** `accepted` is awaiting approval, so it lists but cannot be joined again. */
  status: 'pending' | 'accepted';
}

export interface UserButtonInvitation {
  kind: 'invitation';
  id: string;
  organizationId: string;
  organizationName: string;
  imageUrl?: string;
  /** `accepted` is already a workspace, so it lists as one rather than offering to be accepted. */
  status: 'pending' | 'accepted';
}

/** Feeds one more page into a list as its foot scrolls into view. */
export interface UserButtonPaging {
  ref: (element: HTMLElement | null) => void;
  hasMore: boolean;
}

export interface UserButtonData {
  activeSession: UserButtonSession;
  /**
   * The active organization, described whole rather than found in `memberships`, so the surface
   * names it while the list it belongs to is still loading. `null` => the personal workspace.
   */
  activeOrganization: UserButtonMembership | null;
  /**
   * Explicit; do not derive from `memberships.length`. Answered before the lists are fetched, so
   * the surface knows whether to carry a workspace section at all without waiting on them.
   */
  hasOrganizations: boolean;
  /**
   * A first page is still in flight, so the workspace rows stand in as one placeholder rather than
   * appearing a list at a time.
   */
  organizationsLoading?: boolean;
  memberships: UserButtonMembership[];
  suggestions: UserButtonSuggestion[];
  invitations: UserButtonInvitation[];
  paging?: UserButtonPaging;
  /**
   * The other signed-in accounts. Only sessions: an account's organizations are scoped to the
   * session that fetches them, so they are unknowable until it is the active one.
   */
  additionalSessions: UserButtonSession[];
}

/** All optional. An unhandled action hides (or de-activates) the affordance it drives. */
export interface UserButtonCallbacks {
  /** Acts on the active account; another account's organizations are unreachable until you switch. */
  onSelectOrganization?: (organizationId: string) => void;
  onAcceptSuggestion?: (suggestionId: string) => void;
  onAcceptInvitation?: (invitationId: string) => void;
  onSwitchSession?: (sessionId: string) => void;
  onSignOutSession?: (sessionId: string) => void;
  onSignOutAll?: () => void;
  onManageOrganization?: () => void;
  onInviteMembers?: () => void;
  onManageAccount?: () => void;
  onCreateOrganization?: () => void;
  onAddAccount?: () => void;
}

/**
 * Which switchers the surface carries. `combined` is both; `orgs` is an organization switcher with
 * no account rows; `user` is an account switcher that never shows an organization, even when one
 * is active.
 */
export type UserButtonMode = 'combined' | 'orgs' | 'user';

/**
 * Which of the two switchers a `combined` surface leads with: the one named in the trigger and
 * headed in the popup. Both are still listed either way. The single-purpose modes have only one
 * thing to lead with, so they ignore it.
 */
export type UserButtonModePriority = 'organizations' | 'user';

/**
 * Stable keys naming which affordance owns the single in-flight action. Shared by the connected
 * container (which sets `pendingKey`) and the view (which matches against it).
 */
export const userButtonBusyKeys = {
  selectOrganization: (organizationId: string) => `select-org:${organizationId}`,
  switchSession: (sessionId: string) => `switch:${sessionId}`,
  signOutSession: (sessionId: string) => `sign-out:${sessionId}`,
  signOutAll: () => 'sign-out-all',
  acceptSuggestion: (suggestionId: string) => `accept-suggestion:${suggestionId}`,
  acceptInvitation: (invitationId: string) => `accept-invitation:${invitationId}`,
} as const;

export interface UserButtonBusyState {
  /**
   * Key of the single in-flight action (see `userButtonBusyKeys`), or `null`/absent when idle. The
   * affordance that owns it spins; every other one is disabled so a second action cannot start.
   */
  pendingKey?: string | null;
}

type UserButtonContextValue = UserButtonData &
  UserButtonCallbacks &
  UserButtonBusyState & { mode: UserButtonMode; modePriority: UserButtonModePriority };

// ─── Context ────────────────────────────────────────────────────────────────

const UserButtonContext = React.createContext<UserButtonContextValue | null>(null);

function useUserButtonContext(): UserButtonContextValue {
  const value = React.useContext(UserButtonContext);
  if (!value) {
    throw new Error('UserButton parts must be rendered inside <UserButtonRoot>');
  }
  return value;
}

/** Splits the one in-flight action into the affordance that owns it and every one that must wait. */
function useBusy(key: string): { busy: boolean; disabled: boolean } {
  const { pendingKey } = useUserButtonContext();
  return { busy: pendingKey === key, disabled: Boolean(pendingKey) && pendingKey !== key };
}

interface ActiveWorkspace {
  name: string;
  imageUrl?: string;
  shape: 'circle' | 'square';
  /** Absent when the personal account is what's active. */
  organization?: UserButtonMembership;
}

function workspace(organization: UserButtonMembership | undefined, session: UserButtonSession): ActiveWorkspace {
  if (organization) {
    return { name: organization.name, imageUrl: organization.imageUrl, shape: 'square', organization };
  }
  return { name: session.name, imageUrl: session.imageUrl, shape: 'circle' };
}

/**
 * What the surface leads with: named in the trigger and headed in the popup, so the two always
 * agree. Only an organization-led surface with an organization actually active resolves to one.
 */
function leadWorkspace(data: UserButtonContextValue): ActiveWorkspace {
  const leadsWithOrganization = data.mode === 'combined' ? data.modePriority === 'organizations' : data.mode === 'orgs';
  return workspace(leadsWithOrganization ? (data.activeOrganization ?? undefined) : undefined, data.activeSession);
}

/**
 * `user` mode never lists organizations, and neither does an account with nothing to list. A
 * pending invitation or suggestion counts: it has to be reachable before there is a membership.
 * Loading does not count — `hasOrganizations` is answered before the lists are fetched, so an
 * account with none never opens a section that then disappears under it.
 */
function showsOrganizations(data: UserButtonContextValue): boolean {
  if (data.mode === 'user') {
    return false;
  }
  return data.hasOrganizations || data.suggestions.length > 0 || data.invitations.length > 0;
}

/**
 * The Accounts group only exists to switch between accounts, so it needs another one to switch to.
 * An org-only surface carries no account rows at all, not even the one it belongs to.
 */
function showsAccounts(data: UserButtonContextValue): boolean {
  return data.mode !== 'orgs' && data.additionalSessions.length > 0;
}

/**
 * The heading tells the account rows apart from the workspaces above them, and carries "Add
 * account". An account-only surface lists nothing to tell them apart from, so the rows stand alone
 * and the foot takes the action.
 */
function showsAccountsHeading(data: UserButtonContextValue): boolean {
  return showsAccounts(data) && data.mode !== 'user';
}

function membershipSubtitle(membership: UserButtonMembership): string {
  const parts: string[] = [];
  if (membership.membersCount !== undefined) {
    parts.push(`${membership.membersCount} ${membership.membersCount === 1 ? 'member' : 'members'}`);
  }
  if (membership.planLabel) {
    parts.push(membership.planLabel);
  }
  return parts.join(' · ');
}

function initials(name: string): string {
  const [first = '', second = ''] = name.trim().split(/\s+/);
  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase() || '?';
}

// ─── Presentational leaves ──────────────────────────────────────────────────

interface WorkspaceAvatarProps {
  name: string;
  imageUrl?: string;
  shape: 'circle' | 'square';
  size: AvatarProps['size'];
}

function WorkspaceAvatar({ name, imageUrl, shape, size }: WorkspaceAvatarProps) {
  return (
    // Decorative: every avatar here sits next to the same name in text, or in a labelled button, so
    // exposing the fallback initials would only pad the accessible name ("O Other").
    <Avatar.Root
      aria-hidden
      size={size}
      shape={shape}
    >
      {imageUrl ? (
        <Avatar.Image
          src={imageUrl}
          alt=''
        />
      ) : null}
      <Avatar.Fallback>{initials(name)}</Avatar.Fallback>
    </Avatar.Root>
  );
}

/**
 * Renders `<button>` so a whole row is one click target. Rows with their own controls skip it.
 *
 * A row that is waiting on an action stays a button and takes `disabled`, rather than dropping to a
 * static row: swapping the host element out remounts the row, and the avatar it carries comes back
 * as initials while it re-resolves an image the browser already has.
 */
const asButton =
  (disabled = false) =>
  ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <button
      type='button'
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );

/** A row's trailing column, sized and centred so every state lands on the `⋯` button's centre line. */
function Trailing({ children }: { children: ReactNode }) {
  return <Item.Actions {...stylex.props(styles.trailing)}>{children}</Item.Actions>;
}

interface WorkspaceRowProps {
  name: string;
  imageUrl?: string;
  shape: 'circle' | 'square';
  active?: boolean;
  onSelect?: () => void;
  trailing?: ReactNode;
  busy?: boolean;
  disabled?: boolean;
}

/** One selectable workspace: personal account, organization, suggestion, or invitation. */
function WorkspaceRow({ name, imageUrl, shape, active, onSelect, trailing, busy, disabled }: WorkspaceRowProps) {
  // Selecting what is already selected does nothing, so the active row is not a button at all. A
  // row that is merely waiting stays one, disabled.
  const select = active ? undefined : onSelect;
  const waiting = Boolean(busy || disabled);

  return (
    <Item.Root
      size='xs'
      render={select ? asButton(waiting) : undefined}
      onClick={select}
    >
      <Item.Media>
        <WorkspaceAvatar
          name={name}
          imageUrl={imageUrl}
          shape={shape}
          size='fit'
        />
      </Item.Media>
      <Item.Content>
        <Item.Title>{name}</Item.Title>
      </Item.Content>
      {busy ? (
        <Trailing>
          <Spinner size='sm' />
        </Trailing>
      ) : trailing ? (
        <Item.Actions>{trailing}</Item.Actions>
      ) : active ? (
        <Trailing>
          <Icon
            name='check'
            size='sm'
          />
        </Trailing>
      ) : null}
    </Item.Root>
  );
}

interface ActionRowProps {
  icon: IconName;
  label: string;
  onClick: () => void;
  /** Key from `userButtonBusyKeys` when the action is one-shot; omitted for navigations. */
  busyKey?: string;
}

/** A bare action at the foot of a group ("Add account", "Sign out of all accounts"). */
function ActionRow({ icon, label, onClick, busyKey }: ActionRowProps) {
  const { busy, disabled } = useBusy(busyKey ?? '');

  return (
    <Item.Root
      size='xs'
      render={asButton(busy || disabled)}
      onClick={onClick}
    >
      <Item.Media>
        {busy ? (
          <Spinner size='sm' />
        ) : (
          <Icon
            name={icon}
            size='sm'
          />
        )}
      </Item.Media>
      <Item.Content>
        <Item.Label>{label}</Item.Label>
      </Item.Content>
    </Item.Root>
  );
}

// ─── Sections ───────────────────────────────────────────────────────────────

interface HeaderAction {
  label: string;
  /** An icon renders a square, icon-only button that labels itself through `aria-label`. */
  icon?: IconName;
  onClick: () => void;
  /** Key from `userButtonBusyKeys` when the action is one-shot; omitted for navigations. */
  busyKey?: string;
}

// Hooks cannot run inside a `.map`, so each button is its own component to read its own busy state.
function HeaderActionButton({ label, icon, onClick, busyKey }: HeaderAction) {
  const { busy, disabled } = useBusy(busyKey ?? '');
  // On an icon button the spinner takes the icon's place; on a labelled one it leads the label, so
  // the button keeps its width while the action runs.
  const spinner = busy ? <Spinner size='sm' /> : null;

  return (
    <Button
      variant='outline'
      color='neutral'
      size='sm'
      shape={icon ? 'square' : 'default'}
      aria-label={icon ? label : undefined}
      disabled={busy || disabled}
      onClick={onClick}
    >
      {icon ? (
        (spinner ?? (
          <Icon
            name={icon}
            size='sm'
          />
        ))
      ) : (
        <>
          {spinner}
          {label}
        </>
      )}
    </Button>
  );
}

/** The active workspace: who you are signed in as, and what you can do about it. */
function Header() {
  const data = useUserButtonContext();
  const signOutSession = data.onSignOutSession;
  const { sessionId, email } = data.activeSession;
  const { name, imageUrl, shape, organization } = leadWorkspace(data);
  const subtitle = organization ? membershipSubtitle(organization) : email;
  // Inviting belongs to whichever organization is active, even where the account is what heads the
  // surface. The gear manages whatever the header names.
  const invitable = showsOrganizations(data) ? data.activeOrganization : null;

  const actions: HeaderAction[] = [];
  if (invitable && data.onInviteMembers) {
    actions.push({ label: 'Invite', onClick: data.onInviteMembers });
  }
  // Every other surface hangs "Sign out" off the account's own row. An account-only one has no such
  // row, so it takes the labelled slot **Invite** occupies elsewhere, left of the gear.
  if (data.mode === 'user' && signOutSession) {
    actions.push({
      label: 'Sign out',
      onClick: () => signOutSession(sessionId),
      busyKey: userButtonBusyKeys.signOutSession(sessionId),
    });
  }
  if (organization) {
    if (data.onManageOrganization) {
      actions.push({ label: 'Manage organization', icon: 'cog', onClick: data.onManageOrganization });
    }
  } else if (data.onManageAccount) {
    actions.push({ label: 'Manage account', icon: 'cog', onClick: data.onManageAccount });
  }

  return (
    <Item.Group>
      <Item.Root>
        <Item.Media>
          <WorkspaceAvatar
            name={name}
            imageUrl={imageUrl}
            shape={shape}
            size='fit'
          />
        </Item.Media>
        <Item.Content>
          <Item.Title>{name}</Item.Title>
          {subtitle ? <Item.Description>{subtitle}</Item.Description> : null}
        </Item.Content>
        <Item.Actions>
          {actions.map(a => (
            <HeaderActionButton
              key={a.label}
              {...a}
            />
          ))}
        </Item.Actions>
      </Item.Root>
    </Item.Group>
  );
}

interface AccountAction {
  label: string;
  onClick: () => void;
  color?: 'negative';
}

/** The `⋯` that hangs off a row's trailing edge. Renders nothing when it would be empty. */
function ActionMenu({ label, actions }: { label: string; actions: AccountAction[] }) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <Trailing>
      <Menu.Root>
        <Menu.Trigger aria-label={label} />
        <Menu.Content>
          {actions.map(a => (
            <Menu.Item
              key={a.label}
              label={a.label}
              color={a.color}
              onClick={a.onClick}
            />
          ))}
        </Menu.Content>
      </Menu.Root>
    </Trailing>
  );
}

/**
 * The active account, identified by its email. It heads the workspaces that belong to it and
 * carries the account-wide actions, the way the "Accounts" row heads the other accounts.
 */
function ActiveAccountRow() {
  const data = useUserButtonContext();
  const signOutSession = data.onSignOutSession;
  const { email, sessionId } = data.activeSession;
  // Its actions live in a menu that closes on click, so the row itself carries their spinner.
  const { busy, disabled } = useBusy(userButtonBusyKeys.signOutSession(sessionId));

  const actions: AccountAction[] = [];
  if (data.onCreateOrganization) {
    actions.push({ label: 'Create organization', onClick: data.onCreateOrganization });
  }
  if (data.onManageAccount) {
    actions.push({ label: 'Manage account', onClick: data.onManageAccount });
  }
  if (signOutSession) {
    actions.push({
      label: 'Sign out',
      color: 'negative',
      onClick: () => signOutSession(sessionId),
    });
  }

  return (
    <Item.Root size='xs'>
      <Item.Content>
        <Item.Description
          style={{
            fontWeight: fontWeightVars['--cl-font-medium'],
          }}
        >
          {email}
        </Item.Description>
      </Item.Content>
      {busy ? (
        <Trailing>
          <Spinner size='sm' />
        </Trailing>
      ) : (
        <ActionMenu
          label={`Actions for ${email}`}
          actions={disabled ? [] : actions}
        />
      )}
    </Item.Root>
  );
}

interface MembershipRowProps {
  membership: UserButtonMembership;
  active: boolean;
  onSelect?: () => void;
}

// Hooks cannot run inside a `.map`, so each row is its own component to read its own busy state.
function MembershipRow({ membership, active, onSelect }: MembershipRowProps) {
  const { busy, disabled } = useBusy(userButtonBusyKeys.selectOrganization(membership.organizationId));

  return (
    <WorkspaceRow
      shape='square'
      name={membership.name}
      imageUrl={membership.imageUrl}
      onSelect={onSelect}
      active={active}
      busy={busy}
      disabled={disabled}
    />
  );
}

/** The organizations the active account belongs to. The personal one is the account row above. */
function MembershipRows() {
  const data = useUserButtonContext();
  const selectOrganization = data.onSelectOrganization;

  return (
    <>
      {data.memberships.map(m => (
        <MembershipRow
          key={m.organizationId}
          membership={m}
          onSelect={selectOrganization ? () => selectOrganization(m.organizationId) : undefined}
          active={m.organizationId === data.activeOrganization?.organizationId}
        />
      ))}
    </>
  );
}

interface PendingRowProps {
  busyKey: string;
  name: string;
  imageUrl?: string;
  actionLabel: string;
  onAccept?: () => void;
  /** Replaces the accept button when there is nothing left to do but wait. */
  note?: string;
}

/** A workspace on offer: joined from its own trailing button rather than by clicking the row. */
function PendingRow({ busyKey, name, imageUrl, actionLabel, onAccept, note }: PendingRowProps) {
  const { busy, disabled } = useBusy(busyKey);

  return (
    <WorkspaceRow
      shape='square'
      name={name}
      imageUrl={imageUrl}
      busy={busy}
      trailing={
        note ? (
          <Item.Description>{note}</Item.Description>
        ) : onAccept ? (
          <Button
            variant='outline'
            color='neutral'
            size='sm'
            disabled={disabled}
            onClick={onAccept}
          >
            {actionLabel}
          </Button>
        ) : undefined
      }
    />
  );
}

/** What the active account has been asked to join but has not joined yet. */
function PendingRows() {
  const data = useUserButtonContext();
  const acceptSuggestion = data.onAcceptSuggestion;
  const acceptInvitation = data.onAcceptInvitation;
  const selectOrganization = data.onSelectOrganization;

  // Accepting an invitation joins the organization, so an accepted one is a workspace the surface
  // may already be showing. It stays listed only for as long as the membership list has yet to
  // catch up with it, which is what keeps it reachable in the meantime.
  const listed = new Set(data.memberships.map(m => m.organizationId));
  if (data.activeOrganization) {
    listed.add(data.activeOrganization.organizationId);
  }
  const invitations = data.invitations.filter(i => i.status === 'pending' || !listed.has(i.organizationId));

  return (
    <>
      {data.suggestions.map(s => (
        <PendingRow
          key={s.id}
          busyKey={userButtonBusyKeys.acceptSuggestion(s.id)}
          name={s.name}
          imageUrl={s.imageUrl}
          actionLabel='Join'
          // An accepted suggestion is waiting on an admin, so it reports rather than re-offers.
          note={s.status === 'accepted' ? 'Requested' : undefined}
          onAccept={acceptSuggestion ? () => acceptSuggestion(s.id) : undefined}
        />
      ))}
      {invitations.map(i =>
        // Already joined, so it is a workspace like any other: click the row to switch to it.
        i.status === 'accepted' ? (
          <MembershipRow
            key={i.id}
            membership={{
              kind: 'membership',
              organizationId: i.organizationId,
              name: i.organizationName,
              imageUrl: i.imageUrl,
            }}
            active={false}
            onSelect={selectOrganization ? () => selectOrganization(i.organizationId) : undefined}
          />
        ) : (
          <PendingRow
            key={i.id}
            busyKey={userButtonBusyKeys.acceptInvitation(i.id)}
            name={i.organizationName}
            imageUrl={i.imageUrl}
            actionLabel='Accept'
            onAccept={acceptInvitation ? () => acceptInvitation(i.id) : undefined}
          />
        ),
      )}
    </>
  );
}

/**
 * A signed-in account: a plain row you click to switch to, checked where it is already the active
 * one. Its workspaces cannot be listed here — they are scoped to the session that fetches them —
 * so switching is all it offers.
 */
function AccountRow({ session, active }: { session: UserButtonSession; active?: boolean }) {
  const data = useUserButtonContext();
  const { busy, disabled } = useBusy(userButtonBusyKeys.switchSession(session.sessionId));
  // The account you are already on is not something to switch to, so its row is not a button.
  const switchSession = active ? undefined : data.onSwitchSession;

  return (
    <Item.Root
      size='xs'
      render={switchSession ? asButton(busy || disabled) : undefined}
      onClick={switchSession ? () => switchSession(session.sessionId) : undefined}
    >
      <Item.Media>
        <WorkspaceAvatar
          name={session.name}
          imageUrl={session.imageUrl}
          shape='circle'
          size='fit'
        />
      </Item.Media>
      <Item.Content>
        {/* Identified by email, like the active account's row, so the two read as the same kind. */}
        <Item.Title>{session.email}</Item.Title>
      </Item.Content>
      {busy ? (
        <Trailing>
          <Spinner size='sm' />
        </Trailing>
      ) : active ? (
        <Trailing>
          <Icon
            name='check'
            size='sm'
          />
        </Trailing>
      ) : null}
    </Item.Root>
  );
}

/** Holds the workspace list's place until its first page lands. */
function WorkspaceListLoadingRow() {
  return (
    <Item.Root size='xs'>
      <Item.Media>
        <Spinner size='sm' />
      </Item.Media>
      <Item.Content>
        <Item.Description>Loading organizations…</Item.Description>
      </Item.Content>
    </Item.Root>
  );
}

/** The active account and everything it can switch to. This is the group that scrolls. */
function WorkspaceSection() {
  const data = useUserButtonContext();

  if (!showsOrganizations(data)) {
    return null;
  }

  return (
    <>
      <Item.Separator />
      {/* `auto` rather than `stable`: a reserved gutter insets the rows whether or not the list
          overflows, so short lists would sit their avatars and icons off the edge the header and
          footer align to. */}
      <Item.Group {...stylex.props(...scrollAreaViewport('auto'), styles.scroll)}>
        {data.mode === 'orgs' ? null : <ActiveAccountRow />}
        {/* Memberships, invitations and suggestions are three separate requests landing at three
            different moments. Rendering each as it arrives walks the list in in stages, so the
            placeholder stands in for all of them until the last one is in. */}
        {data.organizationsLoading ? (
          <WorkspaceListLoadingRow />
        ) : (
          <>
            <MembershipRows />
            <PendingRows />
            {data.paging?.hasMore ? <div ref={data.paging.ref} /> : null}
          </>
        )}
      </Item.Group>
    </>
  );
}

/** The heading the account rows sit under, and the account-wide actions it carries. */
function AccountsHeading() {
  const data = useUserButtonContext();

  const actions: AccountAction[] = [];
  if (data.onAddAccount) {
    actions.push({ label: 'Add account', onClick: data.onAddAccount });
  }

  return (
    <Item.Root size='xs'>
      <Item.Content>
        <Item.Label>Accounts</Item.Label>
      </Item.Content>
      <ActionMenu
        label='Account actions'
        actions={actions}
      />
    </Item.Root>
  );
}

/** The signed-in accounts, under their own heading, so they never read as workspaces. */
function AccountsSection() {
  const data = useUserButtonContext();

  if (!showsAccounts(data)) {
    return null;
  }

  return (
    <>
      <Item.Separator />
      <Item.Group>
        {showsAccountsHeading(data) ? (
          <>
            <AccountsHeading />
            {/* Under a heading the group reads as the full set of accounts, so the one you are on
                is listed and checked. Without one it is a list of somewhere else to go. */}
            <AccountRow
              session={data.activeSession}
              active
            />
          </>
        ) : null}
        {data.additionalSessions.map(s => (
          <AccountRow
            key={s.sessionId}
            session={s}
          />
        ))}
      </Item.Group>
    </>
  );
}

/** The actions that close out the surface, plus the Clerk attribution. */
function Footer() {
  const data = useUserButtonContext();

  // An org-only surface has no account menu to carry "Create organization", so it lands here
  // instead, in the slot the account-wide actions occupy everywhere else.
  const actions: ActionRowProps[] = [];
  if (data.mode === 'orgs') {
    if (data.onCreateOrganization) {
      actions.push({ icon: 'plus', label: 'Create organization', onClick: data.onCreateOrganization });
    }
  } else {
    // "Add account" lives in the Accounts heading wherever there is one; without it the foot
    // carries it, the same slot "Create organization" takes on an org-only surface.
    if (data.onAddAccount && !showsAccountsHeading(data)) {
      actions.push({ icon: 'plus', label: 'Add account', onClick: data.onAddAccount });
    }
    if (data.onSignOutAll) {
      actions.push({
        icon: 'log-out',
        label: 'Sign out of all accounts',
        onClick: data.onSignOutAll,
        busyKey: userButtonBusyKeys.signOutAll(),
      });
    }
  }

  return (
    <>
      {actions.length > 0 ? (
        <>
          <Item.Separator />
          <Item.Group>
            {actions.map(action => (
              <ActionRow
                key={action.label}
                {...action}
              />
            ))}
          </Item.Group>
        </>
      ) : null}
      <div {...stylex.props(styles.branding)}>
        Secured by <ClerkLogo height={14} />
      </div>
    </>
  );
}

// ─── Public parts ───────────────────────────────────────────────────────────

export interface UserButtonRootProps extends UserButtonData, UserButtonCallbacks, UserButtonBusyState {
  children: ReactNode;
  /** @default 'combined' */
  mode?: UserButtonMode;
  /**
   * Which switcher a `combined` surface leads with in the trigger and the popup's header. The
   * other one is still listed. Ignored by the single-purpose modes.
   *
   * @default 'organizations'
   */
  modePriority?: UserButtonModePriority;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverProps['placement'];
  sideOffset?: number;
}

/**
 * Owns the account/organization data + callbacks and forwards the popover's open state straight to
 * the headless `Popover.Root` — it does not keep a second controllable-state copy. Leaves consume
 * the data through context.
 */
export function UserButtonRoot(props: UserButtonRootProps) {
  const {
    children,
    mode = 'combined',
    modePriority = 'organizations',
    open,
    defaultOpen,
    onOpenChange,
    placement,
    sideOffset,
    ...data
  } = props;
  return (
    <Popover.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      placement={placement ?? 'bottom-start'}
      sideOffset={sideOffset}
    >
      <UserButtonContext.Provider value={{ ...data, mode, modePriority }}>{children}</UserButtonContext.Provider>
    </Popover.Root>
  );
}

export interface UserButtonTriggerProps {
  /**
   * Names the active workspace beside its avatar — the organization wherever one heads the
   * trigger, the account otherwise. Turn it off for the avatar alone.
   *
   * @default true
   */
  renderTriggerLabel?: boolean;
  /**
   * Carries the active organization's plan beside its name. Part of the label, so it needs
   * `renderTriggerLabel`: a plan badge with nothing to qualify says nothing.
   *
   * @default true
   */
  renderPlanBadge?: boolean;
}

/** The trigger: the active workspace's avatar, and what it is called. */
export function UserButtonTrigger({ renderTriggerLabel = true, renderPlanBadge = true }: UserButtonTriggerProps = {}) {
  const data = useUserButtonContext();
  const { name, imageUrl, shape, organization } = leadWorkspace(data);
  const planLabel = renderPlanBadge ? organization?.planLabel : undefined;

  return (
    <Popover.Trigger
      aria-label={`Open account menu for ${name}`}
      {...stylex.props(styles.trigger, renderTriggerLabel ? styles.triggerLabelled : null, triggerShapes[shape])}
    >
      <WorkspaceAvatar
        name={name}
        imageUrl={imageUrl}
        shape={shape}
        size='sm'
      />
      {renderTriggerLabel ? (
        <>
          <span {...stylex.props(styles.triggerName, truncationStyles.singleLine)}>{name}</span>
          {planLabel ? <Badge color='neutral'>{planLabel}</Badge> : null}
        </>
      ) : null}
    </Popover.Trigger>
  );
}

/**
 * Holds the trigger's space while the controller loads, so nothing shifts when the real avatar
 * lands. Non-interactive.
 */
export function UserButtonTriggerSkeleton() {
  return (
    <div {...stylex.props(styles.trigger, triggerShapes.circle)}>
      <div
        aria-hidden
        {...stylex.props(styles.triggerSkeleton)}
      />
    </div>
  );
}

/** The popover surface: header, workspace list, additional accounts, and footer. */
export function UserButtonPopup() {
  return (
    <Popover.Popup aria-label='Account'>
      {/* The card lays its children out with a row gap; the rows read as one continuous list. */}
      <Card.Root style={{ rowGap: 0 }}>
        <Header />
        <WorkspaceSection />
        <AccountsSection />
        <Footer />
      </Card.Root>
    </Popover.Popup>
  );
}

export type UserButtonProps = Omit<UserButtonRootProps, 'children'> & UserButtonTriggerProps;

/**
 * Presentational all-in-one: renders the trigger + popup from a single prop-driven call. The
 * connected, Clerk-backed `UserButton` lives in `user-button.tsx` and wraps this view.
 */
export function UserButtonView({ renderTriggerLabel, renderPlanBadge, ...root }: UserButtonProps) {
  return (
    <UserButtonRoot {...root}>
      <UserButtonTrigger
        renderTriggerLabel={renderTriggerLabel}
        renderPlanBadge={renderPlanBadge}
      />
      <UserButtonPopup />
    </UserButtonRoot>
  );
}
