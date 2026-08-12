'use client';

import { Button as HeadlessButton } from '@clerk/headless/button';
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
import type { UserButtonLayout } from './user-button.layout';
import { resolveUserButtonLayout } from './user-button.layout';
import { fill, plural, userButtonBase as m } from './user-button.messages';
import { styles, triggerShapes } from './user-button.styles';
import type {
  UserButtonBrandingProps,
  UserButtonBusyState,
  UserButtonCallbacks,
  UserButtonData,
  UserButtonMembership,
  UserButtonMenuItemId,
  UserButtonMenuProps,
  UserButtonModeProps,
  UserButtonSession,
} from './user-button.types';
import { applyOrder } from './user-button.utils';

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
  UserButtonBrandingProps &
  UserButtonMenuProps & { layout: UserButtonLayout };

// ─── Context ────────────────────────────────────────────────────────────────

const UserButtonContext = React.createContext<UserButtonContextValue | null>(null);

function useUserButtonContext(): UserButtonContextValue {
  const value = React.useContext(UserButtonContext);
  if (!value) {
    throw new Error('UserButton parts must be rendered inside <UserButtonRoot>');
  }
  return value;
}

/**
 * Splits the one in-flight action into the affordance that owns it and every one that must wait.
 * An affordance with no key of its own — a navigation, or a menu that only opens — owns nothing, so
 * it never spins, but it still waits.
 */
function useBusy(key?: string): { busy: boolean; disabled: boolean } {
  const { pendingKey } = useUserButtonContext();
  if (!pendingKey) {
    return { busy: false, disabled: false };
  }
  return { busy: pendingKey === key, disabled: pendingKey !== key };
}

interface ActiveWorkspace {
  name: string;
  imageUrl?: string;
  shape: 'circle' | 'square';
  /** Absent when the personal account is what's active. */
  organization?: UserButtonMembership;
}

/**
 * What the surface leads with: named in the trigger and headed in the popup, so the two always
 * agree. Only an organization-led surface with an organization actually active resolves to one.
 */
function leadWorkspace({ layout, activeOrganization, activeSession }: UserButtonContextValue): ActiveWorkspace {
  const organization = layout.leadWith === 'organization' ? activeOrganization : null;
  return organization
    ? { name: organization.name, imageUrl: organization.imageUrl, shape: 'square', organization }
    : { name: activeSession.name, imageUrl: activeSession.imageUrl, shape: 'circle' };
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

interface RowAvatarProps {
  name: string;
  imageUrl?: string;
  shape: 'circle' | 'square';
  size: AvatarProps['size'];
}

function RowAvatar({ name, imageUrl, shape, size }: RowAvatarProps) {
  return (
    // Decorative: the same name is always in text alongside. Held at the root so the whole mark
    // stays out of the accessible name however the image resolves.
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
 * A row waiting on an action stays a button: swapping the host element out remounts the row, and
 * its avatar drops back to a blank placeholder while it re-resolves an image the browser already has.
 *
 * `focusableWhenDisabled` is what keeps a standing-down row in the tab order: the row that owns the
 * action stands down along with the rest, and the native attribute would drop it out just as its
 * spinner is announced, taking focus with it. The headless `Button` marks it `aria-disabled` and
 * drops the press instead.
 */
const rowButton = (disabled = false) => (
  <HeadlessButton
    disabled={disabled}
    focusableWhenDisabled
  />
);

/** A row's trailing column, sized and centred so every state lands on the `⋯` button's centre line. */
function Trailing({ children }: { children: ReactNode }) {
  return <Item.Actions {...stylex.props(styles.trailing)}>{children}</Item.Actions>;
}

interface SwitcherRowProps {
  name: string;
  /**
   * Names the avatar where that differs from the row's own title: a session row is titled by its
   * identifier, but the mark stands for the person. The fallback holds this without painting it.
   *
   * @default name
   */
  avatarName?: string;
  imageUrl?: string;
  shape: 'circle' | 'square';
  /** Names the title element, for a control in the row that has to point at the workspace it acts on. */
  labelId?: string;
  active?: boolean;
  onSelect?: () => void;
  trailing?: ReactNode;
  busy?: boolean;
  disabled?: boolean;
}

/** One selectable row: personal account, organization, suggestion, invitation, or another account. */
function SwitcherRow({
  name,
  avatarName = name,
  imageUrl,
  shape,
  labelId,
  active,
  onSelect,
  trailing,
  busy,
  disabled,
}: SwitcherRowProps) {
  // Selecting what is already selected does nothing, so the active row is not a button at all. A
  // row that is merely waiting stays one, disabled.
  const select = active ? undefined : onSelect;
  const waiting = Boolean(busy || disabled);

  return (
    <Item.Root
      size='xs'
      // The check is decorative, so without this the active row reads like the ones you can switch to.
      aria-current={active ? 'true' : undefined}
      // Every row stands down `aria-disabled` together, so on its own that reads as unavailable
      // rather than as running. Carried beside the indicator below, the way `SubmitButton` pairs them.
      aria-busy={busy || undefined}
      render={select ? rowButton(waiting) : undefined}
      onClick={select}
    >
      <Item.Media>
        <RowAvatar
          name={avatarName}
          imageUrl={imageUrl}
          shape={shape}
          size='fit'
        />
      </Item.Media>
      <Item.Content>
        <Item.Label id={labelId}>{name}</Item.Label>
      </Item.Content>
      {busy ? (
        <Trailing>
          <Spinner
            // Focus stays on the row for the length of the action, so the row is what gets re-read
            // when it changes. A decorative spinner changes nothing there and the wait passes in
            // silence, so the indicator is named in its own right — the pairing `SubmitButton`
            // makes, and the reason its pending state is spoken where this one was not.
            role='progressbar'
            aria-hidden={undefined}
            aria-label={m.workspaces.pending}
            size='sm'
          />
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
  const { busy, disabled } = useBusy(busyKey);

  return (
    <Item.Root
      size='xs'
      // A link is the browser's navigation rather than one of the surface's one-shot actions, so it
      // has nothing to wait behind and never stands down.
      render={href ? asAnchor(href) : rowButton(busy || disabled)}
      onClick={onClick}
    >
      <Item.Media>{busy ? <Spinner size='sm' /> : icon}</Item.Media>
      <Item.Content>
        <Item.Label variant='secondary'>{label}</Item.Label>
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
  const { busy, disabled } = useBusy(busyKey);
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

  const actions: HeaderAction[] = [];
  for (const action of data.layout.actions.header) {
    if (action === 'inviteMembers' && data.onInviteMembers) {
      actions.push({ label: m.manage.invite, onClick: data.onInviteMembers });
    }
    // Every other mode hangs "Sign out" off the organization heading. An account-only one has no
    // such heading, so it takes the labelled slot **Invite** occupies elsewhere, left of the gear.
    if (action === 'signOut' && signOutSession) {
      actions.push({
        label: m.accounts.signOut,
        onClick: () => signOutSession(sessionId),
        busyKey: userButtonBusyKeys.signOutSession(sessionId),
      });
    }
    // The gear manages whatever the header names, which is settled by the data rather than the mode.
    if (action === 'manageLead') {
      const manage = organization
        ? { label: m.manage.organization, onClick: data.onManageOrganization }
        : { label: m.manage.account, onClick: data.onManageAccount };
      if (manage.onClick) {
        actions.push({ label: manage.label, icon: 'cog', onClick: manage.onClick });
      }
    }
  }

  return (
    <Item.Group>
      <Item.Root>
        <Item.Media>
          <RowAvatar
            name={name}
            imageUrl={imageUrl}
            shape={shape}
            size='fit'
          />
        </Item.Media>
        <Item.Content>
          <Item.Label>{name}</Item.Label>
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

interface RowAction {
  label: string;
  onClick: () => void;
  color?: 'negative';
}

/** The `⋯` that hangs off a row's trailing edge. Renders nothing when it would be empty. */
function ActionMenu({ label, actions, disabled }: { label: string; actions: RowAction[]; disabled?: boolean }) {
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
 * Heads the organization list, named by the active account's identifier: these are the workspaces
 * that account can switch between. Carries the account-wide actions, the way the "Accounts" heading
 * below carries the ones that act on every account.
 */
function OrganizationsHeading() {
  const data = useUserButtonContext();
  const signOutSession = data.onSignOutSession;
  const { identifier, sessionId } = data.activeSession;
  // Its actions live in a menu that closes on click, so the row itself carries their spinner.
  const { busy, disabled } = useBusy(userButtonBusyKeys.signOutSession(sessionId));

  const actions: RowAction[] = [];
  for (const action of data.layout.actions.organizationsHeading) {
    if (action === 'createOrganization' && data.onCreateOrganization) {
      actions.push({ label: m.manage.createOrganization, onClick: data.onCreateOrganization });
    }
    if (action === 'manageAccount' && data.onManageAccount) {
      actions.push({ label: m.manage.account, onClick: data.onManageAccount });
    }
    if (action === 'signOut' && signOutSession) {
      actions.push({
        label: m.accounts.signOut,
        color: 'negative',
        onClick: () => signOutSession(sessionId),
      });
    }
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
          label={fill(m.accounts.actionsFor, { identifier })}
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
    <SwitcherRow
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
  const { busy, disabled } = useBusy(userButtonBusyKeys.selectOrganization(null));

  if (data.hidePersonal) {
    return null;
  }

  return (
    <SwitcherRow
      name={m.workspaces.personal}
      imageUrl={data.activeSession.imageUrl}
      shape='circle'
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
  // The button reads the same on every offer and the workspace it acts on is the label beside it,
  // so pressing tab through the list gives no way to tell them apart without this.
  const labelId = React.useId();

  return (
    <SwitcherRow
      shape='square'
      name={name}
      imageUrl={imageUrl}
      labelId={labelId}
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
            pendingLabel={m.workspaces.pending}
            spinDelay={{ delay: 0 }}
            disabled={disabled}
            aria-describedby={labelId}
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
function SessionRow({ session, active }: { session: UserButtonSession; active?: boolean }) {
  const data = useUserButtonContext();
  const switchSession = data.onSwitchSession;
  const { busy, disabled } = useBusy(userButtonBusyKeys.switchSession(session.sessionId));

  return (
    <SwitcherRow
      // Named by its identifier, like the active account's row, so the two read as the same kind.
      name={session.identifier}
      avatarName={session.name}
      imageUrl={session.imageUrl}
      shape='circle'
      active={active}
      onSelect={switchSession ? () => switchSession(session.sessionId) : undefined}
      busy={busy}
      disabled={disabled}
    />
  );
}

/** Holds the organization list's place until its first page lands. */
function OrganizationListLoadingRow() {
  return (
    // Plain text rather than a live region: it mounts with its copy already in it, so there is no
    // change for one to report, and the popup it lands in is read on open either way.
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

/**
 * The workspaces the active account can switch between, under the account's own heading. This is
 * the group that scrolls.
 *
 * The heading can render without the list: an account with no organizations still needs somewhere
 * to manage and sign out of itself.
 */
function OrganizationSection() {
  const data = useUserButtonContext();
  const { showOrganizations, showOrganizationsHeading } = data.layout;

  if (!showOrganizations && !showOrganizationsHeading) {
    return null;
  }

  return (
    <>
      <Item.Separator />
      {/* `auto` rather than `stable`: a reserved gutter insets the rows whether or not the list
          overflows, so short lists would sit their avatars and icons off the edge the header and
          footer align to. */}
      <Item.Group {...stylex.props(...scrollAreaViewport('auto'), styles.scroll)}>
        {showOrganizationsHeading ? <OrganizationsHeading /> : null}
        {/* Memberships, invitations and suggestions are three separate requests landing at three
            different moments. Rendering each as it arrives walks the list in in stages, so the
            placeholder stands in for all of them until the last one is in. */}
        {showOrganizations &&
          (data.organizationsLoading ? (
            <OrganizationListLoadingRow />
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

/** The heading the session rows sit under, and the actions across every account it carries. */
function SessionsHeading() {
  const data = useUserButtonContext();
  // Everything it opens is a navigation, so it owns no action of its own to spin. It still stands
  // down while one runs, the way the organization heading's `⋯` does.
  const { disabled } = useBusy();

  const actions: RowAction[] = [];
  for (const action of data.layout.actions.sessionsHeading) {
    if (action === 'addAccount' && data.onAddAccount) {
      actions.push({ label: m.accounts.add, onClick: data.onAddAccount });
    }
  }

  return (
    <Item.Root size='xs'>
      <Item.Content>
        <Item.Label variant='secondary'>{m.accounts.heading}</Item.Label>
      </Item.Content>
      <ActionMenu
        label={m.accounts.menu}
        actions={actions}
        disabled={disabled}
      />
    </Item.Root>
  );
}

/** The other signed-in accounts, under their own heading, so they never read as workspaces. */
function SessionSection() {
  const data = useUserButtonContext();

  if (!data.layout.showSessions) {
    return null;
  }

  return (
    <>
      <Item.Separator />
      <Item.Group>
        {data.layout.showSessionsHeading ? (
          <>
            <SessionsHeading />
            {/* Under a heading the group reads as the full set of accounts, so the one you are on
                is listed and checked. Without one it is a list of somewhere else to go. */}
            <SessionRow
              session={data.activeSession}
              active
            />
          </>
        ) : null}
        {data.additionalSessions.map(s => (
          <SessionRow
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

  // "Create organization" and "Add account" both make something new, and the foot is where a mode
  // ends up putting whichever of them it has nowhere else for, so they share the icon.
  const plus = (
    <Icon
      name='plus'
      size='sm'
    />
  );

  const builtIn: ActionRowProps[] = [];
  for (const action of data.layout.actions.footer) {
    if (action === 'createOrganization' && data.onCreateOrganization) {
      builtIn.push({
        id: 'createOrganization',
        icon: plus,
        label: m.manage.createOrganization,
        onClick: data.onCreateOrganization,
      });
    }
    if (action === 'addAccount' && data.onAddAccount) {
      builtIn.push({ id: 'addAccount', icon: plus, label: m.accounts.add, onClick: data.onAddAccount });
    }
    if (action === 'signOutAll' && data.onSignOutAll) {
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

  // Custom rows lead by default, the way the existing UserButton lists them above "Add account".
  const actions = applyOrder<ActionRowProps>(
    data.menuItemOrder,
    [...(data.customMenuItems ?? []), ...builtIn],
    r => r.id,
  );

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
      {data.branded === false ? null : (
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
      )}
    </>
  );
}

// ─── Public parts ───────────────────────────────────────────────────────────

export interface UserButtonRootProps
  extends
    UserButtonData,
    UserButtonCallbacks,
    UserButtonBusyState,
    UserButtonBrandingProps,
    UserButtonMenuProps,
    UserButtonModeProps {
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
  // Resolved here so the sections below never read `mode` again: which affordance lands in which
  // slot is settled once, in one table, rather than re-derived by each part that renders one.
  const layout = resolveUserButtonLayout(mode, modePriority, data);

  return (
    <Popover.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      placement={placement ?? 'bottom-start'}
      sideOffset={sideOffset}
    >
      <UserButtonContext.Provider value={{ ...data, layout }}>{children}</UserButtonContext.Provider>
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
  renderTriggerBadge?: boolean;
}

/** The trigger: the active workspace's avatar, and what it is called. */
export function UserButtonTrigger({
  renderTriggerLabel = true,
  renderTriggerBadge = true,
}: UserButtonTriggerProps = {}): ReactElement {
  const data = useUserButtonContext();
  const { name, imageUrl, shape, organization } = leadWorkspace(data);
  const planLabel = renderTriggerBadge ? organization?.planLabel : undefined;

  return (
    <Popover.Trigger
      aria-label={fill(m.trigger.open, { name })}
      {...stylex.props(styles.trigger, renderTriggerLabel ? styles.triggerLabelled : null, triggerShapes[shape])}
    >
      <RowAvatar
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

/** The popover surface: header, organizations, other accounts, and footer. */
export function UserButtonPopup(): ReactElement {
  return (
    <Popover.Popup aria-label={m.popup.label}>
      {/* The card lays its children out with a row gap; the rows read as one continuous list. */}
      <Card.Root style={{ rowGap: 0 }}>
        <Header />
        <OrganizationSection />
        <SessionSection />
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
export function UserButtonView({ renderTriggerLabel, renderTriggerBadge, ...root }: UserButtonProps): ReactElement {
  return (
    <UserButtonRoot {...root}>
      <UserButtonTrigger
        renderTriggerLabel={renderTriggerLabel}
        renderTriggerBadge={renderTriggerBadge}
      />
      <UserButtonPopup />
    </UserButtonRoot>
  );
}
