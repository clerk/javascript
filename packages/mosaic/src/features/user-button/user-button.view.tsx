'use client';

import * as stylex from '@stylexjs/stylex';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';

import type { AvatarProps } from '../../components/avatar';
import { Avatar } from '../../components/avatar';
import { Badge } from '../../components/badge';
import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { Icon } from '../../components/icon';
import { Menu } from '../../components/menu';
import { Popover } from '../../components/popover';
import { scrollAreaViewport } from '../../components/scroll-area';
import { Spinner } from '../../components/spinner';
import type { IconName } from '../../icons/registry';
import type { MosaicMessages } from '../../localization';
import { fill, plural, useLocale, useMessages } from '../../localization';
import { Button as HeadlessButton } from '../../primitives/button';
import type { PopoverProps } from '../../primitives/popover';
import { themeProps } from '../../props';
import { applyOrder } from '../../utils/apply-order';
import { focusOutline } from '../../utils/focus-outline.styles';
import { rtl } from '../../utils/rtl.styles';
import { truncationStyles } from '../../utils/typography.styles';
import type { UserButtonAction, UserButtonLayout, UserButtonSlot } from './user-button.layout';
import { resolveUserButtonLayout } from './user-button.layout';
import { styles } from './user-button.styles';
import type {
  UserButtonBrandingProps,
  UserButtonBusyState,
  UserButtonCallbacks,
  UserButtonData,
  UserButtonHeaderLayout,
  UserButtonMembership,
  UserButtonMenuItemId,
  UserButtonMenuProps,
  UserButtonModeProps,
  UserButtonSession,
} from './user-button.types';
import { UserButtonHeader } from './user-button-header.view';
import {
  UserButtonGroup,
  UserButtonItem,
  UserButtonItemContent,
  UserButtonItemDescription,
  UserButtonItemLabel,
  UserButtonItemMedia,
  UserButtonItemTrailing,
  UserButtonSeparator,
} from './user-button-item.view';

// The data contract, the mode flags, and the menu item shapes live in `user-button.types`; they are
// what the model and the view agree on, so neither file owns them.
export type * from './user-button.types';

/**
 * Stable keys naming which affordance owns the single in-flight action. Shared by the connected
 * container (which sets `pendingKey`) and the view (which matches against it).
 */
export const userButtonBusyKeys = {
  selectOrganization: (organizationId: string | null) => `select-org:${organizationId ?? 'personal'}`,
  switchSession: (sessionId: string) => `switch:${sessionId}`,
  signOutSession: (sessionId: string, from: UserButtonSlot) => `sign-out:${from}:${sessionId}`,
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

type ActiveWorkspace =
  | {
      kind: 'organization';
      name: string;
      imageUrl?: string;
      shape: 'square';
      organization: UserButtonMembership;
    }
  | { kind: 'user'; name: string; imageUrl?: string; shape: 'circle' }
  | { kind: 'none'; name: string; imageUrl?: string; shape: 'square' };

/**
 * What the surface leads with: named in the trigger and headed in the popup, so the two always
 * agree. An organization-led surface with no org and no personal workspace is no selection.
 */
type Messages = MosaicMessages['userButton'];

function leadWorkspace(
  { layout, activeOrganization, activeSession }: UserButtonContextValue,
  m: Messages,
): ActiveWorkspace {
  if (layout.lead === 'organization' && activeOrganization) {
    return {
      kind: 'organization',
      name: activeOrganization.name,
      imageUrl: activeOrganization.imageUrl,
      shape: 'square',
      organization: activeOrganization,
    };
  }
  if (layout.lead === 'none') {
    return { kind: 'none', name: m.workspaces.notSelected, shape: 'square' };
  }
  return {
    kind: 'user',
    name: activeSession.name,
    imageUrl: activeSession.imageUrl,
    shape: 'circle',
  };
}

function joinDetails(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' · ');
}

function membershipSubtitle(membership: UserButtonMembership, m: Messages, locale: string): string {
  const members =
    membership.membersCount === undefined ? undefined : plural(m.workspaces.members, membership.membersCount, locale);
  return joinDetails(membership.planLabel, members);
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
  xstyle?: AvatarProps['xstyle'];
}

function RowAvatar({ name, imageUrl, shape, size, xstyle }: RowAvatarProps) {
  return (
    // Decorative: the same name is always in text alongside. Held at the root so the whole mark
    // stays out of the accessible name however the image resolves.
    <Avatar.Root
      aria-hidden
      size={size}
      shape={shape}
      xstyle={xstyle}
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

// Focus stays on the row for the length of the action, so the row is what gets re-read when it
// changes. A decorative spinner changes nothing there and the wait passes in silence, so the
// indicator is named in its own right — the pairing `SubmitButton` makes, and the reason its
// pending state is spoken where this one was not.
function PendingSpinner() {
  const m = useMessages('userButton');
  return (
    <Spinner
      role='progressbar'
      aria-hidden={undefined}
      aria-label={m.workspaces.pending}
      size='sm'
    />
  );
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
    <UserButtonItem
      // The check is decorative, so without this the active row reads like the ones you can switch to.
      aria-current={active ? 'true' : undefined}
      // Every row stands down `aria-disabled` together, so on its own that reads as unavailable
      // rather than as running. Carried beside the indicator below, the way `SubmitButton` pairs them.
      aria-busy={busy || undefined}
      render={select ? rowButton(waiting) : undefined}
      onClick={select}
    >
      <UserButtonItemMedia>
        <RowAvatar
          name={avatarName}
          imageUrl={imageUrl}
          shape={shape}
          size='fit'
          xstyle={styles.rowAvatar}
        />
      </UserButtonItemMedia>
      <UserButtonItemContent>
        <UserButtonItemLabel id={labelId}>{name}</UserButtonItemLabel>
      </UserButtonItemContent>
      {busy ? (
        <UserButtonItemTrailing>
          <PendingSpinner />
        </UserButtonItemTrailing>
      ) : trailing ? (
        <UserButtonItemTrailing>{trailing}</UserButtonItemTrailing>
      ) : active ? (
        <UserButtonItemTrailing>
          <Icon
            name='checkmark'
            size='sm'
          />
        </UserButtonItemTrailing>
      ) : null}
    </UserButtonItem>
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
    <UserButtonItem
      // A link is the browser's navigation rather than one of the surface's one-shot actions, so it
      // has nothing to wait behind and never stands down.
      aria-busy={busy || undefined}
      render={href ? asAnchor(href) : rowButton(busy || disabled)}
      onClick={onClick}
    >
      <UserButtonItemMedia>{busy ? <PendingSpinner /> : icon}</UserButtonItemMedia>
      <UserButtonItemContent>
        <UserButtonItemLabel variant='interactive'>{label}</UserButtonItemLabel>
      </UserButtonItemContent>
    </UserButtonItem>
  );
}

// ─── Sections ───────────────────────────────────────────────────────────────

interface HeaderAction {
  id: UserButtonAction;
  label: string;
  icon: IconName;
  /** Inline, the button is square and shows the icon alone, labelling itself through `aria-label`. */
  iconOnly?: boolean;
  onClick: () => void;
  /** Key from `userButtonBusyKeys` when the action is one-shot; omitted for navigations. */
  busyKey?: string;
}

// Hooks cannot run inside a `.map`, so each button is its own component to read its own busy state.
function HeaderActionButton({
  layout,
  label,
  icon,
  iconOnly,
  onClick,
  busyKey,
}: HeaderAction & { layout: UserButtonHeaderLayout }) {
  const m = useMessages('userButton');
  const { busy, disabled } = useBusy(busyKey);
  const stacked = layout === 'stacked';
  const compact = !stacked && iconOnly;
  const buttonProps = {
    variant: 'outline',
    color: 'neutral',
    size: 'sm',
    shape: compact ? 'square' : 'default',
    fullWidth: stacked,
    'aria-label': compact ? label : undefined,
    disabled,
    onClick,
  } as const;
  const leading =
    stacked || compact ? (
      <Icon
        name={icon}
        size='sm'
      />
    ) : null;
  const text = compact ? null : label;

  if (busyKey === undefined) {
    return (
      <Button {...buttonProps}>
        {leading}
        {text}
      </Button>
    );
  }

  return (
    <SubmitButton
      {...buttonProps}
      type='button'
      isPending={busy}
      pendingLabel={m.workspaces.pending}
      spinDelay={{ delay: 0 }}
    >
      {leading}
      {text}
    </SubmitButton>
  );
}

/** The active workspace: who you are signed in as, and what you can do about it. */
function Header() {
  const m = useMessages('userButton');
  const locale = useLocale();
  const data = useUserButtonContext();
  const layout = data.layout.headerLayout;
  const signOutSession = data.onSignOutSession;
  const { sessionId, identifier } = data.activeSession;
  const workspace = leadWorkspace(data, m);
  const { name } = workspace;
  const organization = workspace.kind === 'organization' ? workspace.organization : undefined;
  // An account with no name is titled by its identifier, and repeating it underneath says nothing.
  // No selection is not the account, so it carries no identifier line either.
  const subtitle =
    workspace.kind === 'organization'
      ? membershipSubtitle(workspace.organization, m, locale)
      : workspace.kind === 'user' && identifier !== name
        ? identifier
        : '';

  const actions: HeaderAction[] = [];
  for (const action of data.layout.actions.header) {
    if (action === 'inviteMembers' && data.onInviteMembers) {
      actions.push({ id: action, label: m.manage.invite, icon: 'users-add-right', onClick: data.onInviteMembers });
    }
    // An account that leads takes "Sign out" in the labelled slot **Invite** holds for an organization.
    if (action === 'signOut' && signOutSession) {
      actions.push({
        id: action,
        label: m.accounts.signOut,
        icon: 'sign-out',
        onClick: () => signOutSession(sessionId, 'header'),
        busyKey: userButtonBusyKeys.signOutSession(sessionId, 'header'),
      });
    }
    // The gear manages whatever the header names, which is settled by the data rather than the mode.
    // Inline it is the icon alone, named for what it manages; stacked it reads "Settings".
    if (action === 'manageLead') {
      const manage = organization
        ? { label: m.manage.organization, onClick: data.onManageOrganization }
        : { label: m.manage.account, onClick: data.onManageAccount };
      if (manage.onClick) {
        actions.push({
          id: action,
          label: layout === 'stacked' ? m.manage.settings : manage.label,
          icon: 'cog-6-teeth',
          iconOnly: true,
          onClick: manage.onClick,
        });
      }
    }
  }
  // Inline, the gear trails the labelled actions; stacked, it leads them.
  const ordered =
    layout === 'stacked'
      ? [...actions.filter(a => a.id === 'manageLead'), ...actions.filter(a => a.id !== 'manageLead')]
      : actions;

  return (
    <UserButtonHeader
      layout={layout}
      avatar={
        <RowAvatar
          name={workspace.name}
          imageUrl={workspace.imageUrl}
          shape={workspace.shape}
          size='sm'
        />
      }
      title={name}
      description={subtitle}
      actions={
        ordered.length > 0
          ? ordered.map(a => (
              <HeaderActionButton
                key={a.id}
                layout={layout}
                {...a}
              />
            ))
          : undefined
      }
    />
  );
}

interface RowAction {
  label: string;
  onClick: () => void;
  color?: 'negative';
}

/** The `⋯` that hangs off a row's trailing edge. Renders nothing when it would be empty. */
interface ActionMenuProps {
  label: string;
  actions: RowAction[];
  busy?: boolean;
  disabled?: boolean;
}

function ActionMenu({ label, actions, busy = false, disabled }: ActionMenuProps) {
  const m = useMessages('userButton');
  if (actions.length === 0) {
    return null;
  }

  return (
    <UserButtonItemTrailing>
      <Menu.Root>
        <Menu.Trigger
          aria-label={label}
          disabled={busy || disabled}
          render={props => (
            <SubmitButton
              variant='ghost'
              size='sm'
              shape='square'
              type='button'
              isPending={busy}
              pendingLabel={m.workspaces.pending}
              spinDelay={{ delay: 0 }}
              focusableWhenDisabled
              {...props}
            />
          )}
        />
        <Menu.Popup>
          {actions.map(a => (
            <Menu.Item
              key={a.label}
              label={a.label}
              color={a.color}
              onClick={a.onClick}
            >
              <Menu.Label>{a.label}</Menu.Label>
            </Menu.Item>
          ))}
        </Menu.Popup>
      </Menu.Root>
    </UserButtonItemTrailing>
  );
}

/**
 * Heads the organization list, named by the active account's identifier: these are the workspaces
 * that account can switch between. Carries the account-wide actions, the way the "Accounts" heading
 * below carries the ones that act on every account.
 */
function OrganizationsHeading() {
  const m = useMessages('userButton');
  const data = useUserButtonContext();
  const signOutSession = data.onSignOutSession;
  const { identifier, sessionId } = data.activeSession;
  // Its actions live in a menu that closes on click, so the row itself carries their spinner.
  const { busy, disabled } = useBusy(userButtonBusyKeys.signOutSession(sessionId, 'organizationsHeading'));

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
        onClick: () => signOutSession(sessionId, 'organizationsHeading'),
      });
    }
  }

  return (
    <UserButtonItem>
      <UserButtonItemContent>
        <UserButtonItemDescription xstyle={styles.accountIdentifier}>{identifier}</UserButtonItemDescription>
      </UserButtonItemContent>
      <ActionMenu
        label={fill(m.accounts.actionsFor, { identifier })}
        actions={actions}
        busy={busy}
        disabled={disabled}
      />
    </UserButtonItem>
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
  const m = useMessages('userButton');
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
  const m = useMessages('userButton');
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
          <UserButtonItemDescription>{note}</UserButtonItemDescription>
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
  const m = useMessages('userButton');
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
 * A signed-in account inside the accounts flyout: a menu item you pick to switch to, checked where
 * it is already the active one. Its workspaces cannot be listed here — they are scoped to the
 * session that fetches them — so switching is all it offers.
 */
function SessionMenuItem({ session, active }: { session: UserButtonSession; active: boolean }) {
  const data = useUserButtonContext();
  const switchSession = data.onSwitchSession;

  return (
    <Menu.Item
      // Named by its identifier, like the active account's row, so the two read as the same kind.
      label={session.identifier}
      // The check is decorative, so without this the active item reads like the ones you can
      // switch to.
      aria-current={active ? 'true' : undefined}
      // Picking what is already picked does nothing, so the active item only closes the flyout.
      onClick={active || !switchSession ? undefined : () => switchSession(session.sessionId)}
    >
      <Menu.Media>
        <RowAvatar
          name={session.name}
          imageUrl={session.imageUrl}
          shape='circle'
          size='fit'
          xstyle={styles.rowAvatar}
        />
      </Menu.Media>
      <Menu.Label>{session.identifier}</Menu.Label>
      {active ? (
        <Menu.Media>
          <Icon
            name='checkmark'
            size='sm'
          />
        </Menu.Media>
      ) : null}
    </Menu.Item>
  );
}

/**
 * The accounts affordance at the foot: a row that opens a flyout of every signed-in account, and
 * of the way to add one more.
 *
 * The flyout closes on pick, so the row itself carries the switch's spinner, the way the
 * organizations heading carries the spinner for what its own `⋯` opens.
 */
function SwitchAccountRow() {
  const m = useMessages('userButton');
  const data = useUserButtonContext();
  const addAccount = data.onAddAccount;
  const { pendingKey } = data;
  const busy = data.additionalSessions.some(s => pendingKey === userButtonBusyKeys.switchSession(s.sessionId));
  const { disabled } = useBusy();

  return (
    // It opens out of the popup, so the opposite side is the popup itself. Where the viewport is
    // too narrow for either side — a phone — it goes above the row instead of under the card.
    // The row is inset 8px, so the sideways gap clears that before it clears the card's edge. Above
    // the row there is nothing to clear, so that gap is the plain one.
    <Menu.Root
      placement='right-start'
      sideOffset={{ x: 12, y: 8 }}
      fallbackPlacements={['left-start', 'top-start', 'bottom-start']}
    >
      <Menu.Trigger
        aria-busy={busy || undefined}
        render={<UserButtonItem render={rowButton(disabled)} />}
      >
        <UserButtonItemMedia>
          {busy ? (
            <PendingSpinner />
          ) : (
            <Icon
              name='switch-account'
              size='sm'
            />
          )}
        </UserButtonItemMedia>
        <UserButtonItemContent>
          <UserButtonItemLabel variant='interactive'>{m.accounts.switch}</UserButtonItemLabel>
        </UserButtonItemContent>
        <UserButtonItemTrailing>
          <Icon
            name='chevron-right'
            xstyle={rtl.mirror}
            size='sm'
          />
        </UserButtonItemTrailing>
      </Menu.Trigger>
      <Menu.Popup>
        {/* The account it is on leads, checked: the flyout is the full set of accounts rather than
            a list of somewhere else to go. */}
        <SessionMenuItem
          session={data.activeSession}
          active
        />
        {data.additionalSessions.map(s => (
          <SessionMenuItem
            key={s.sessionId}
            session={s}
            active={false}
          />
        ))}
        {addAccount ? (
          <Menu.Item
            label={m.accounts.add}
            onClick={addAccount}
          >
            <Menu.Media>
              <Icon
                name='plus'
                size='sm'
              />
            </Menu.Media>
            <Menu.Label>{m.accounts.add}</Menu.Label>
          </Menu.Item>
        ) : null}
      </Menu.Popup>
    </Menu.Root>
  );
}

/** Holds the organization list's place until its first page lands. */
function OrganizationListLoadingRow() {
  const m = useMessages('userButton');
  return (
    // Plain text rather than a live region: it mounts with its copy already in it, so there is no
    // change for one to report, and the popup it lands in is read on open either way.
    <UserButtonItem>
      <UserButtonItemMedia>
        <Spinner size='sm' />
      </UserButtonItemMedia>
      <UserButtonItemContent>
        <UserButtonItemDescription>{m.workspaces.loading}</UserButtonItemDescription>
      </UserButtonItemContent>
    </UserButtonItem>
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
  const m = useMessages('userButton');
  const data = useUserButtonContext();
  const { showOrganizations, showOrganizationsHeading } = data.layout;

  const actions: ReactNode[] = [];
  for (const action of data.layout.actions.organizationsFooter) {
    if (action === 'createOrganization' && data.onCreateOrganization) {
      actions.push(
        <ActionRow
          key='createOrganization'
          icon={
            <Icon
              name='plus'
              size='sm'
            />
          }
          label={m.manage.createOrganization}
          onClick={data.onCreateOrganization}
        />,
      );
    }
  }

  if (!showOrganizations && !showOrganizationsHeading && actions.length === 0) {
    return null;
  }

  return (
    <>
      <UserButtonSeparator />
      {/* `auto` rather than `stable`: a reserved gutter insets the rows whether or not the list
          overflows, so short lists would sit their avatars and icons off the edge the header and
          footer align to. */}
      <UserButtonGroup xstyle={[scrollAreaViewport('auto'), styles.scroll]}>
        {showOrganizationsHeading ? <OrganizationsHeading /> : null}
        {/* Memberships, invitations and suggestions are three separate requests landing at three
            different moments. Rendering each as it arrives walks the list in in stages, so the
            placeholder stands in for all of them until the last one is in. */}
        {showOrganizations &&
          (data.organizationsLoading ? (
            <OrganizationListLoadingRow />
          ) : (
            <>
              <PersonalRow />
              <MembershipRows />
              <PendingRows />
              {data.paging?.hasMore ? <div ref={data.paging.ref} /> : null}
            </>
          ))}
        {/* Trails the rows rather than sitting at the foot of the surface: what it offers is one
            more of the workspaces above it, not an action on the account. */}
        {actions}
      </UserButtonGroup>
    </>
  );
}

/** One row at the foot: whatever it renders, and the id `menuItemOrder` places it by. */
interface FooterRow {
  id: UserButtonMenuItemId | (string & {});
  node: ReactNode;
}

/** The actions that close out the surface. */
function Footer() {
  const m = useMessages('userButton');
  const data = useUserButtonContext();
  const signOutSession = data.onSignOutSession;
  const { sessionId } = data.activeSession;

  const builtIn: FooterRow[] = [];
  for (const action of data.layout.actions.footer) {
    // The only foot row that is not a plain action: it opens rather than doing, so it brings its
    // own element instead of an `ActionRow`'s props.
    if (action === 'switchAccount') {
      builtIn.push({ id: 'switchAccount', node: <SwitchAccountRow /> });
    }
    if (action === 'addAccount' && data.onAddAccount) {
      builtIn.push({
        id: 'addAccount',
        node: (
          <ActionRow
            icon={
              <Icon
                name='plus'
                size='sm'
              />
            }
            label={m.accounts.add}
            onClick={data.onAddAccount}
          />
        ),
      });
    }
    if (action === 'signOut' && signOutSession) {
      builtIn.push({
        id: 'signOut',
        node: (
          <ActionRow
            icon={
              <Icon
                name='sign-out'
                size='sm'
              />
            }
            label={m.accounts.signOut}
            onClick={() => signOutSession(sessionId, 'footer')}
            busyKey={userButtonBusyKeys.signOutSession(sessionId, 'footer')}
          />
        ),
      });
    }
    if (action === 'signOutAll' && data.onSignOutAll) {
      builtIn.push({
        id: 'signOutAll',
        node: (
          <ActionRow
            icon={
              <Icon
                name='sign-out'
                size='sm'
                xstyle={rtl.mirror}
              />
            }
            label={m.accounts.signOutAll}
            onClick={data.onSignOutAll}
            busyKey={userButtonBusyKeys.signOutAll()}
          />
        ),
      });
    }
  }

  const custom: FooterRow[] = (data.customMenuItems ?? []).map(({ id, ...item }) => ({
    id,
    node: <ActionRow {...item} />,
  }));

  // Custom rows lead by default, the way the existing UserButton lists them above "Add account".
  const rows = applyOrder<FooterRow>(data.menuItemOrder, [...custom, ...builtIn], r => r.id);

  if (rows.length === 0) {
    return null;
  }

  return (
    <>
      <UserButtonSeparator />
      <UserButtonGroup>
        {rows.map(r => (
          <React.Fragment key={r.id}>{r.node}</React.Fragment>
        ))}
      </UserButtonGroup>
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
  const { children, mode = 'combined', open, defaultOpen, onOpenChange, placement, sideOffset, ...data } = props;
  // Resolved here so the sections below never read `mode` again: which affordance lands in which
  // slot is settled once, in one table, rather than re-derived by each part that renders one.
  const layout = resolveUserButtonLayout(mode, data);

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
   * trigger, no selection when personal is hidden and none is active, the account otherwise.
   * Turn it off for the avatar alone.
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
  const m = useMessages('userButton');
  const data = useUserButtonContext();
  const workspace = leadWorkspace(data, m);
  const { name, shape } = workspace;
  const planLabel =
    renderTriggerBadge && workspace.kind === 'organization' ? workspace.organization.planLabel : undefined;

  return (
    <Popover.Trigger
      {...themeProps('user-button-trigger')}
      aria-label={fill(m.trigger.open, { name })}
      xstyle={[
        focusOutline.visible,
        styles.trigger,
        renderTriggerLabel ? styles.triggerLabelled : styles.triggerAvatarOnly,
        !renderTriggerLabel && shape === 'circle' ? styles.triggerRound : null,
      ]}
    >
      <RowAvatar
        name={workspace.name}
        imageUrl={workspace.imageUrl}
        shape={workspace.shape}
        size={renderTriggerLabel ? 'xs' : 'sm'}
      />
      {renderTriggerLabel ? (
        <>
          <span {...stylex.props(styles.triggerName, truncationStyles.singleLine)}>{name}</span>
          {planLabel ? <Badge color='neutral'>{planLabel}</Badge> : null}
          <Icon
            name='chevron-down'
            size='sm'
            xstyle={styles.triggerCaret}
          />
        </>
      ) : null}
    </Popover.Trigger>
  );
}

/** The popover surface: header, organizations, and footer. */
export function UserButtonPopup(): ReactElement {
  const m = useMessages('userButton');
  const { renderBranding } = useUserButtonContext();

  return (
    <Popover.Popup
      {...themeProps('user-button-popover')}
      aria-label={m.popup.label}
    >
      <Card.Root renderBranding={renderBranding}>
        <Header />
        <OrganizationSection />
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
