'use client';

import type { PopoverProps } from '@clerk/headless/popover';
import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import React from 'react';

import type { AvatarProps } from '../components/avatar';
import { Avatar } from '../components/avatar';
import { Button } from '../components/button';
import { Card } from '../components/card';
import { ClerkLogo } from '../components/clerk-logo';
import { Icon } from '../components/icon';
import { Item } from '../components/item';
import { Menu } from '../components/menu';
import { Popover } from '../components/popover';
import { Skeleton } from '../components/skeleton';
import { Spinner } from '../components/spinner';
import type { IconName } from '../icons/registry';
import { fontWeightVars, space } from '../tokens.stylex';
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
}

/** Feeds one more page into a list as its foot scrolls into view. */
export interface UserButtonPaging {
  ref: (element: HTMLElement | null) => void;
  hasMore: boolean;
}

export interface UserButtonData {
  activeSession: UserButtonSession;
  /** `null` => the personal workspace is active. */
  activeOrganizationId: string | null;
  /** Explicit; do not derive from `memberships.length`. */
  hasOrganizations: boolean;
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

type UserButtonContextValue = UserButtonData & UserButtonCallbacks & UserButtonBusyState & { mode: UserButtonMode };

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

function activeMembership(data: UserButtonData): UserButtonMembership | undefined {
  if (data.activeOrganizationId === null) {
    return undefined;
  }
  return data.memberships.find(m => m.organizationId === data.activeOrganizationId);
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

/** The trigger follows the organization wherever one is active; `user` mode never resolves to one. */
function triggerWorkspace(data: UserButtonContextValue): ActiveWorkspace {
  return workspace(data.mode === 'user' ? undefined : activeMembership(data), data.activeSession);
}

/**
 * Only an org-only surface is headed by the organization. Everywhere else the account heads it, so
 * switching organization never changes who the popup says you are signed in as.
 */
function headerWorkspace(data: UserButtonContextValue): ActiveWorkspace {
  return workspace(data.mode === 'orgs' ? activeMembership(data) : undefined, data.activeSession);
}

/** `user` mode never lists organizations, and neither does an account without any. */
function showsOrganizations(data: UserButtonContextValue): boolean {
  return data.mode !== 'user' && data.hasOrganizations;
}

/**
 * The Accounts group only exists to switch between accounts, so it needs another one to switch to.
 * An org-only surface carries no account rows at all, not even the one it belongs to.
 */
function showsAccounts(data: UserButtonContextValue): boolean {
  return data.mode !== 'orgs' && data.additionalSessions.length > 0;
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
    <Avatar.Root
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

/** Renders `<button>` so a whole row is one click target. Rows with their own controls skip it. */
const asButton = ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <button
    type='button'
    {...props}
  >
    {children}
  </button>
);

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
  // Selecting what is already selected does nothing, so the active row is not a button at all —
  // and neither is a row whose action is running or is waiting on another one.
  const select = active || busy || disabled ? undefined : onSelect;

  return (
    <Item.Root
      size='xs'
      render={select ? asButton : undefined}
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
        <Item.Actions>
          <Spinner />
        </Item.Actions>
      ) : trailing ? (
        <Item.Actions>{trailing}</Item.Actions>
      ) : null}
      {active ? (
        <Item.Actions>
          <Icon
            name='check'
            size='sm'
            style={{
              width: space['7'],
            }}
          />
        </Item.Actions>
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
  const act = busy || disabled ? undefined : onClick;

  return (
    <Item.Root
      size='xs'
      render={act ? asButton : undefined}
      onClick={act}
    >
      <Item.Media>
        {busy ? (
          <Spinner />
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
}

/** The active workspace: who you are signed in as, and what you can do about it. */
function Header() {
  const data = useUserButtonContext();
  const { name, imageUrl, shape, organization } = headerWorkspace(data);
  const subtitle = organization ? membershipSubtitle(organization) : data.activeSession.email;
  // Inviting belongs to whichever organization is active, even where the account is what heads the
  // surface. The gear manages whatever the header names. Signing out is a row in the list below.
  const invitable = showsOrganizations(data) ? activeMembership(data) : undefined;

  const actions: HeaderAction[] = [];
  if (invitable && data.onInviteMembers) {
    actions.push({ label: 'Invite', onClick: data.onInviteMembers });
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
            <Button
              key={a.label}
              variant='outline'
              color='neutral'
              size='sm'
              shape={a.icon ? 'square' : 'default'}
              aria-label={a.icon ? a.label : undefined}
              onClick={a.onClick}
            >
              {a.icon ? (
                <Icon
                  name={a.icon}
                  size='sm'
                />
              ) : (
                a.label
              )}
            </Button>
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
    <Item.Actions>
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
    </Item.Actions>
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
        <Item.Actions>
          <Spinner />
        </Item.Actions>
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
          active={m.organizationId === data.activeOrganizationId}
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
      {data.invitations.map(i => (
        <PendingRow
          key={i.id}
          busyKey={userButtonBusyKeys.acceptInvitation(i.id)}
          name={i.organizationName}
          imageUrl={i.imageUrl}
          actionLabel='Accept'
          onAccept={acceptInvitation ? () => acceptInvitation(i.id) : undefined}
        />
      ))}
    </>
  );
}

/**
 * Another signed-in account: a plain row you click to switch to. Its workspaces cannot be listed
 * here — they are scoped to the session that fetches them — so switching is all it offers.
 */
function AdditionalSession({ session }: { session: UserButtonSession }) {
  const data = useUserButtonContext();
  const { busy, disabled } = useBusy(userButtonBusyKeys.switchSession(session.sessionId));
  const switchSession = data.onSwitchSession && !busy && !disabled ? data.onSwitchSession : undefined;

  return (
    <Item.Root
      size='xs'
      render={switchSession ? asButton : undefined}
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
        <Item.Actions>
          <Spinner />
        </Item.Actions>
      ) : null}
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
      <Item.Group {...stylex.props(styles.scroll)}>
        {data.mode === 'orgs' ? null : <ActiveAccountRow />}
        <MembershipRows />
        <PendingRows />
        {data.paging?.hasMore ? <div ref={data.paging.ref} /> : null}
      </Item.Group>
    </>
  );
}

/** The other signed-in accounts, under their own heading, so they never read as workspaces. */
function AccountsSection() {
  const data = useUserButtonContext();

  if (!showsAccounts(data)) {
    return null;
  }

  const actions: AccountAction[] = [];
  if (data.onAddAccount) {
    actions.push({ label: 'Add account', onClick: data.onAddAccount });
  }

  return (
    <>
      <Item.Separator />
      <Item.Group>
        <Item.Root size='xs'>
          <Item.Content>
            <Item.Label>Accounts</Item.Label>
          </Item.Content>
          <ActionMenu
            label='Account actions'
            actions={actions}
          />
        </Item.Root>
        {data.additionalSessions.map(s => (
          <AdditionalSession
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
    // The Accounts group heads itself with "Add account"; the footer carries it only without one.
    if (data.onAddAccount && !showsAccounts(data)) {
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
  const { children, mode = 'combined', open, defaultOpen, onOpenChange, placement, sideOffset, ...data } = props;
  return (
    <Popover.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      placement={placement ?? 'bottom-start'}
      sideOffset={sideOffset}
    >
      <UserButtonContext.Provider value={{ ...data, mode }}>{children}</UserButtonContext.Provider>
    </Popover.Root>
  );
}

/** The trigger: the active workspace's avatar, and nothing else. */
export function UserButtonTrigger() {
  const data = useUserButtonContext();
  const { name, imageUrl, shape } = triggerWorkspace(data);

  return (
    <Popover.Trigger
      aria-label={`Open account menu for ${name}`}
      {...stylex.props(styles.trigger, triggerShapes[shape])}
    >
      <WorkspaceAvatar
        name={name}
        imageUrl={imageUrl}
        shape={shape}
        size='sm'
      />
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
      <Skeleton
        width='1.75rem'
        height='1.75rem'
        sx={t => ({ borderRadius: t.rounded.full })}
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

export type UserButtonProps = Omit<UserButtonRootProps, 'children'>;

/**
 * Presentational all-in-one: renders the trigger + popup from a single prop-driven call. The
 * connected, Clerk-backed `UserButton` lives in `user-button.tsx` and wraps this view.
 */
export function UserButtonView(props: UserButtonProps) {
  return (
    <UserButtonRoot {...props}>
      <UserButtonTrigger />
      <UserButtonPopup />
    </UserButtonRoot>
  );
}
