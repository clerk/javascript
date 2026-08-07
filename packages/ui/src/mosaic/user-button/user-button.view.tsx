'use client';

import type { PopoverProps } from '@clerk/headless/popover';
import * as stylex from '@stylexjs/stylex';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';

import type { AvatarProps } from '../components/avatar';
import { Avatar } from '../components/avatar';
import { Badge } from '../components/badge';
import { Button, SubmitButton } from '../components/button';
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
import { arrangeMenuRows } from './user-button.menu';
import { fill, plural, userButtonBase as m } from './user-button.messages';
import { styles, triggerShapes } from './user-button.styles';
import type {
  UserButtonBusyState,
  UserButtonCallbacks,
  UserButtonData,
  UserButtonMembership,
  UserButtonMenuItemId,
  UserButtonMenuProps,
  UserButtonMode,
  UserButtonModePriority,
  UserButtonModeProps,
  UserButtonSession,
} from './user-button.types';

// The data contract, the mode flags, and the menu item shapes live in `user-button.types`; they are
// what the controller and the view agree on, so neither file owns them.
export type * from './user-button.types';

/**
 * Stable keys naming which affordance owns the single in-flight action. Shared by the connected
 * container (which sets `pendingKey`) and the view (which matches against it).
 */
export const userButtonBusyKeys = {
  selectOrganization: (organizationId: string | null) => `select-org:${organizationId ?? 'personal'}`,
  switchSession: (sessionId: string) => `switch:${sessionId}`,
  signOutSession: (sessionId: string) => `sign-out:${sessionId}`,
  signOutAll: () => 'sign-out-all',
  acceptSuggestion: (suggestionId: string) => `accept-suggestion:${suggestionId}`,
  acceptInvitation: (invitationId: string) => `accept-invitation:${invitationId}`,
} as const;

type UserButtonContextValue = UserButtonData &
  UserButtonCallbacks &
  UserButtonBusyState &
  UserButtonMenuProps & { mode: UserButtonMode; modePriority: UserButtonModePriority };

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

/** Whether the surface leads with an organization. `combined` asks `modePriority`; the other two already know. */
function leadsWithOrganization(mode: UserButtonMode, modePriority: UserButtonModePriority): boolean {
  return mode === 'combined' ? modePriority === 'organization' : mode === 'organization';
}

/**
 * What the surface leads with: named in the trigger and headed in the popup, so the two always
 * agree. Only an organization-led surface with an organization actually active resolves to one.
 */
function leadWorkspace(data: UserButtonContextValue): ActiveWorkspace {
  const leadsWithOrg = leadsWithOrganization(data.mode, data.modePriority);
  return workspace(leadsWithOrg ? (data.activeOrganization ?? undefined) : undefined, data.activeSession);
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
  return data.mode !== 'organization' && data.additionalSessions.length > 0;
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
    parts.push(plural(m.workspaces.members, membership.membersCount));
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
      // The check is decorative, so without this the active row reads like the ones you can switch to.
      aria-current={active ? 'true' : undefined}
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

const asAnchor =
  (href: string) =>
  ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <a
      href={href}
      {...props}
    >
      {children}
    </a>
  );

interface ActionRowProps {
  /** Identifies the row, for ordering. */
  id: UserButtonMenuItemId | (string & {});
  icon?: ReactNode;
  label: string;
  /** Where the row goes, for a row that leaves rather than acting. */
  href?: string;
  onClick?: () => void;
  /** Key from `userButtonBusyKeys` when the action is one-shot; omitted for navigations. */
  busyKey?: string;
}

/** A bare action at the foot of a group ("Add account", "Sign out of all accounts"). */
function ActionRow({ icon, label, href, onClick, busyKey }: ActionRowProps) {
  const { busy, disabled } = useBusy(busyKey ?? '');

  return (
    <Item.Root
      size='xs'
      // A link is the browser's navigation rather than one of the surface's one-shot actions, so it
      // has nothing to wait behind and never stands down.
      render={href ? asAnchor(href) : asButton(busy || disabled)}
      onClick={onClick}
    >
      <Item.Media>{busy ? <Spinner size='sm' /> : icon}</Item.Media>
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
  const { sessionId, identifier } = data.activeSession;
  const { name, imageUrl, shape, organization } = leadWorkspace(data);
  // An account with no name is titled by its identifier, and repeating it underneath says nothing.
  const accountSubtitle = identifier === name ? '' : identifier;
  const subtitle = organization ? membershipSubtitle(organization) : accountSubtitle;
  // Inviting belongs to whichever organization is active, even where the account is what heads the
  // surface. The gear manages whatever the header names.
  const invitable = showsOrganizations(data) ? data.activeOrganization : null;

  const actions: HeaderAction[] = [];
  if (invitable && data.onInviteMembers) {
    actions.push({ label: m.manage.invite, onClick: data.onInviteMembers });
  }
  // Every other surface hangs "Sign out" off the account's own row. An account-only one has no such
  // row, so it takes the labelled slot **Invite** occupies elsewhere, left of the gear.
  if (data.mode === 'user' && signOutSession) {
    actions.push({
      label: m.accounts.signOut,
      onClick: () => signOutSession(sessionId),
      busyKey: userButtonBusyKeys.signOutSession(sessionId),
    });
  }
  if (organization) {
    if (data.onManageOrganization) {
      actions.push({ label: m.manage.organization, icon: 'cog', onClick: data.onManageOrganization });
    }
  } else if (data.onManageAccount) {
    actions.push({ label: m.manage.account, icon: 'cog', onClick: data.onManageAccount });
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
function ActionMenu({ label, actions, disabled }: { label: string; actions: AccountAction[]; disabled?: boolean }) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <Trailing>
      <Menu.Root>
        <Menu.Trigger
          aria-label={label}
          disabled={disabled}
        />
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
 * The active account, named by its identifier. It heads the workspaces that belong to it and
 * carries the account-wide actions, the way the "Accounts" row heads the other accounts.
 */
function ActiveAccountRow() {
  const data = useUserButtonContext();
  const signOutSession = data.onSignOutSession;
  const { identifier, sessionId } = data.activeSession;
  // Its actions live in a menu that closes on click, so the row itself carries their spinner.
  const { busy, disabled } = useBusy(userButtonBusyKeys.signOutSession(sessionId));

  const actions: AccountAction[] = [];
  if (data.onCreateOrganization) {
    actions.push({ label: m.manage.createOrganization, onClick: data.onCreateOrganization });
  }
  if (data.onManageAccount) {
    actions.push({ label: m.manage.account, onClick: data.onManageAccount });
  }
  if (signOutSession) {
    actions.push({
      label: m.accounts.signOut,
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
          {identifier}
        </Item.Description>
      </Item.Content>
      {busy ? (
        <Trailing>
          <Spinner size='sm' />
        </Trailing>
      ) : (
        <ActionMenu
          label={`Actions for ${identifier}`}
          actions={actions}
          disabled={disabled}
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

/**
 * The account's own workspace, which is what "no active organization" is. Listed alongside the
 * organizations so switching into one is not a one-way door: `null` is how you leave.
 *
 * Named for what it is among organizations rather than for the account, the way the existing
 * OrganizationSwitcher names it. The trigger and header name the account itself, since that is
 * what they are about.
 */
function PersonalRow() {
  const data = useUserButtonContext();
  const selectOrganization = data.onSelectOrganization;
  const { imageUrl, shape } = workspace(undefined, data.activeSession);
  const { busy, disabled } = useBusy(userButtonBusyKeys.selectOrganization(null));

  if (data.hidePersonal) {
    return null;
  }

  return (
    <WorkspaceRow
      name={m.workspaces.personal}
      imageUrl={imageUrl}
      shape={shape}
      active={!data.activeOrganization}
      onSelect={selectOrganization ? () => selectOrganization(null) : undefined}
      busy={busy}
      disabled={disabled}
    />
  );
}

/** The organizations the active account belongs to. Its own workspace is the row above. */
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
      trailing={
        note ? (
          <Item.Description>{note}</Item.Description>
        ) : onAccept ? (
          // Every other affordance here swaps its icon for a spinner, but this one is a labelled
          // button, so the spinner goes inside it rather than taking the row's trailing edge — the
          // press and the thing that reports it stay the same element. `pendingKey` is already
          // spin-delayed by the container, so this asks for no second delay of its own.
          <SubmitButton
            type='button'
            variant='outline'
            color='neutral'
            size='sm'
            isPending={busy}
            spinDelay={{ delay: 0 }}
            disabled={disabled}
            onClick={onAccept}
          >
            {actionLabel}
          </SubmitButton>
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
      {/* Invitations first: one is addressed to this account and joins on accept, where a
          suggestion only files a request. Same order as the existing OrganizationSwitcher. */}
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
            actionLabel={m.workspaces.accept}
            onAccept={acceptInvitation ? () => acceptInvitation(i.id) : undefined}
          />
        ),
      )}
      {data.suggestions.map(s => (
        <PendingRow
          key={s.id}
          busyKey={userButtonBusyKeys.acceptSuggestion(s.id)}
          name={s.name}
          imageUrl={s.imageUrl}
          actionLabel={m.workspaces.join}
          // An accepted suggestion is waiting on an admin, so it reports rather than re-offers.
          note={s.status === 'accepted' ? m.workspaces.requested : undefined}
          onAccept={acceptSuggestion ? () => acceptSuggestion(s.id) : undefined}
        />
      ))}
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
      aria-current={active ? 'true' : undefined}
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
        {/* Named by its identifier, like the active account's row, so the two read as the same kind. */}
        <Item.Title>{session.identifier}</Item.Title>
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
        <Item.Description>{m.workspaces.loading}</Item.Description>
      </Item.Content>
    </Item.Root>
  );
}

/** The active account and everything it can switch to. This is the group that scrolls. */
function WorkspaceSection() {
  const data = useUserButtonContext();
  // The account row carries the account's own actions, so it is not the workspace list's to
  // withhold: an account with no organizations still needs somewhere to manage and sign out of it.
  // The other two surfaces name the account in their header instead, or are not about it at all.
  const accountRow = data.mode === 'combined' ? <ActiveAccountRow /> : null;
  const listsOrganizations = showsOrganizations(data);

  if (!accountRow && !listsOrganizations) {
    return null;
  }

  return (
    <>
      <Item.Separator />
      {/* `auto` rather than `stable`: a reserved gutter insets the rows whether or not the list
          overflows, so short lists would sit their avatars and icons off the edge the header and
          footer align to. */}
      <Item.Group {...stylex.props(...scrollAreaViewport('auto'), styles.scroll)}>
        {accountRow}
        {/* Memberships, invitations and suggestions are three separate requests landing at three
            different moments. Rendering each as it arrives walks the list in in stages, so the
            placeholder stands in for all of them until the last one is in. */}
        {listsOrganizations &&
          (data.organizationsLoading ? (
            <WorkspaceListLoadingRow />
          ) : (
            <>
              {/* What is on offer leads the list: an invitation or suggestion is the one row here
                  that goes away if it is not acted on, and the workspaces held are not going
                  anywhere. This is the order the existing OrganizationSwitcher lists them in. */}
              <PendingRows />
              <PersonalRow />
              <MembershipRows />
              {data.paging?.hasMore ? <div ref={data.paging.ref} /> : null}
            </>
          ))}
      </Item.Group>
    </>
  );
}

/** The heading the account rows sit under, and the account-wide actions it carries. */
function AccountsHeading() {
  const data = useUserButtonContext();

  const actions: AccountAction[] = [];
  if (data.onAddAccount) {
    actions.push({ label: m.accounts.add, onClick: data.onAddAccount });
  }

  return (
    <Item.Root size='xs'>
      <Item.Content>
        <Item.Label>{m.accounts.heading}</Item.Label>
      </Item.Content>
      <ActionMenu
        label={m.accounts.menu}
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
  const builtIn: ActionRowProps[] = [];
  if (data.mode === 'organization') {
    if (data.onCreateOrganization) {
      builtIn.push({
        id: 'createOrganization',
        icon: (
          <Icon
            name='plus'
            size='sm'
          />
        ),
        label: m.manage.createOrganization,
        onClick: data.onCreateOrganization,
      });
    }
  } else {
    // "Add account" lives in the Accounts heading wherever there is one; without it the foot
    // carries it, the same slot "Create organization" takes on an org-only surface.
    if (data.onAddAccount && !showsAccountsHeading(data)) {
      builtIn.push({
        id: 'addAccount',
        icon: (
          <Icon
            name='plus'
            size='sm'
          />
        ),
        label: m.accounts.add,
        onClick: data.onAddAccount,
      });
    }
    if (data.onSignOutAll) {
      builtIn.push({
        id: 'signOutAll',
        icon: (
          <Icon
            name='log-out'
            size='sm'
          />
        ),
        label: m.accounts.signOutAll,
        onClick: data.onSignOutAll,
        busyKey: userButtonBusyKeys.signOutAll(),
      });
    }
  }

  const actions = arrangeMenuRows<ActionRowProps>(data.menuItemOrder, data.customMenuItems ?? [], builtIn);

  return (
    <>
      {actions.length > 0 ? (
        <>
          <Item.Separator />
          <Item.Group>
            {actions.map(action => (
              <ActionRow
                key={action.id}
                {...action}
              />
            ))}
          </Item.Group>
        </>
      ) : null}
      <div {...stylex.props(styles.branding)}>
        {m.branding.securedBy}{' '}
        <a
          href='https://go.clerk.com/components'
          target='_blank'
          rel='noopener noreferrer'
          {...stylex.props(styles.brandingLink)}
        >
          <ClerkLogo height={14} />
        </a>
      </div>
    </>
  );
}

// ─── Public parts ───────────────────────────────────────────────────────────

export interface UserButtonRootProps
  extends UserButtonData, UserButtonCallbacks, UserButtonBusyState, UserButtonMenuProps, UserButtonModeProps {
  children: ReactNode;
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
export function UserButtonRoot(props: UserButtonRootProps): ReactElement {
  const {
    children,
    mode = 'combined',
    modePriority = 'organization',
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
export function UserButtonTrigger({
  renderTriggerLabel = true,
  renderPlanBadge = true,
}: UserButtonTriggerProps = {}): ReactElement {
  const data = useUserButtonContext();
  const { name, imageUrl, shape, organization } = leadWorkspace(data);
  const planLabel = renderPlanBadge ? organization?.planLabel : undefined;

  return (
    <Popover.Trigger
      aria-label={fill(m.trigger.open, { name })}
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

/** The popover surface: header, workspace list, additional accounts, and footer. */
export function UserButtonPopup(): ReactElement {
  return (
    <Popover.Popup aria-label={m.popup.label}>
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
export function UserButtonView({ renderTriggerLabel, renderPlanBadge, ...root }: UserButtonProps): ReactElement {
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
