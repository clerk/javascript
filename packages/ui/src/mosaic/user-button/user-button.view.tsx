'use client';

import type { PopoverProps } from '@clerk/headless/popover';
import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import React from 'react';

import { Avatar } from '../components/avatar';
import { Button } from '../components/button';
import { Card } from '../components/card';
import { Icon } from '../components/icon';
import { Item } from '../components/item';
import { Menu } from '../components/menu';
import { Popover } from '../components/popover';
import type { IconName } from '../icons/registry';
import { space } from '../tokens.stylex';
import { styles, triggerShapes } from './user-button.styles';

// ─── Data contract ──────────────────────────────────────────────────────────
// Session-backed, discriminated resource rows. Intended to be 1:1 with a future
// `useUserButtonController()` output so the controller is a drop-in follow-up.

export interface UserButtonSession {
  sessionId: string;
  userId: string;
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
  upgradeable?: boolean;
  membershipRequestCount?: number;
}

export interface UserButtonSuggestion {
  kind: 'suggestion';
  id: string;
  organizationId: string;
  name: string;
  imageUrl?: string;
  status: 'pending' | 'accepted';
}

export interface UserButtonInvitation {
  kind: 'invitation';
  id: string;
  organizationId: string;
  organizationName: string;
  imageUrl?: string;
}

export interface UserButtonData {
  status: 'loading' | 'ready';
  activeSession: UserButtonSession;
  /** `null` => the personal workspace is active. */
  activeOrganizationId: string | null;
  /** Explicit; do not derive from `memberships.length`. */
  hasOrganizations: boolean;
  memberships: UserButtonMembership[];
  suggestions: UserButtonSuggestion[];
  invitations: UserButtonInvitation[];
  additionalSessions: UserButtonSession[];
}

/** All optional. An unhandled action hides (or de-activates) the affordance it drives. */
export interface UserButtonCallbacks {
  onSelectOrganization?: (organizationId: string) => void;
  onSelectPersonal?: () => void;
  onAcceptSuggestion?: (suggestionId: string) => void;
  onAcceptInvitation?: (invitationId: string) => void;
  onSwitchSession?: (sessionId: string) => void;
  onSignOutSession?: (sessionId: string) => void;
  onSignOutAll?: () => void;
  onManageOrganization?: () => void;
  onManageMembers?: () => void;
  onManageAccount?: () => void;
  onCreateOrganization?: () => void;
  onAddAccount?: () => void;
  onUpgrade?: () => void;
}

type UserButtonContextValue = UserButtonData & UserButtonCallbacks;

// ─── Context ────────────────────────────────────────────────────────────────

const UserButtonContext = React.createContext<UserButtonContextValue | null>(null);

function useUserButtonContext(): UserButtonContextValue {
  const value = React.useContext(UserButtonContext);
  if (!value) {
    throw new Error('UserButton parts must be rendered inside <UserButtonRoot>');
  }
  return value;
}

function activeMembership(data: UserButtonData): UserButtonMembership | undefined {
  if (data.activeOrganizationId === null) {
    return undefined;
  }
  return data.memberships.find(m => m.organizationId === data.activeOrganizationId);
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
  size: 'fit' | 'md';
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
}

/** One selectable workspace: personal account, organization, suggestion, or invitation. */
function WorkspaceRow({ name, imageUrl, shape, active, onSelect, trailing }: WorkspaceRowProps) {
  return (
    <Item.Root
      size='xs'
      render={onSelect ? asButton : undefined}
      onClick={onSelect}
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
      {trailing ? <Item.Actions>{trailing}</Item.Actions> : null}
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
}

/** A bare action at the foot of a group ("Add account", "Sign out of all accounts"). */
function ActionRow({ icon, label, onClick }: ActionRowProps) {
  return (
    <Item.Root
      size='xs'
      render={asButton}
      onClick={onClick}
    >
      <Item.Media>
        <Icon
          name={icon}
          size='sm'
        />
      </Item.Media>
      <Item.Content>
        <Item.Label>{label}</Item.Label>
      </Item.Content>
    </Item.Root>
  );
}

// ─── Sections ───────────────────────────────────────────────────────────────

interface HeaderAction {
  icon: IconName;
  label: string;
  /** Icon-only actions label themselves through `aria-label`. */
  iconOnly: boolean;
  onClick: () => void;
}

/** The active workspace: who you are signed in as, and what you can do about it. */
function Header() {
  const data = useUserButtonContext();
  const org = activeMembership(data);
  const isOrg = org !== undefined;
  const name = isOrg ? org.name : data.activeSession.name;
  const imageUrl = isOrg ? org.imageUrl : data.activeSession.imageUrl;
  const subtitle = isOrg ? membershipSubtitle(org) : data.activeSession.email;

  const actions: HeaderAction[] = [];
  if (isOrg) {
    if (data.onManageOrganization) {
      actions.push({ icon: 'cog', label: 'Manage organization', iconOnly: true, onClick: data.onManageOrganization });
    }
    if (data.onManageMembers) {
      actions.push({ icon: 'users', label: 'Members', iconOnly: true, onClick: data.onManageMembers });
    }
  } else {
    if (data.onManageAccount) {
      actions.push({ icon: 'cog', label: 'Manage account', iconOnly: true, onClick: data.onManageAccount });
    }
    const signOut = data.onSignOutSession;
    if (signOut) {
      actions.push({
        icon: 'log-out',
        label: 'Sign out',
        iconOnly: false,
        onClick: () => signOut(data.activeSession.sessionId),
      });
    }
  }

  const showUpgrade = isOrg && org.upgradeable === true && data.onUpgrade !== undefined;

  return (
    <Item.Group>
      <Item.Root>
        <Item.Media>
          <WorkspaceAvatar
            name={name}
            imageUrl={imageUrl}
            shape={isOrg ? 'square' : 'circle'}
            size='fit'
          />
        </Item.Media>
        <Item.Content>
          <Item.Title>{name}</Item.Title>
          {subtitle ? <Item.Description>{subtitle}</Item.Description> : null}
        </Item.Content>
        <Item.Actions>
          {showUpgrade ? (
            <Button
              variant='link'
              size='sm'
              onClick={data.onUpgrade}
            >
              Upgrade
            </Button>
          ) : null}
          {actions.map(a => (
            <Button
              key={a.label}
              variant='outline'
              color='neutral'
              size='sm'
              shape={a.iconOnly ? 'square' : 'default'}
              aria-label={a.iconOnly ? a.label : undefined}
              onClick={a.onClick}
            >
              <Icon
                name={a.icon}
                size='sm'
              />
              {a.iconOnly ? null : a.label}
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

/**
 * An account, identified by its email. Every account renders this way — the active one heading
 * its workspaces, the others under the separator — so a row is never mistaken for a workspace.
 */
function AccountRow({ email, actions }: { email: string; actions: AccountAction[] }) {
  return (
    <Item.Root size='xs'>
      <Item.Content>
        <Item.Description>{email}</Item.Description>
      </Item.Content>
      {actions.length > 0 ? (
        <Item.Actions>
          <Menu.Root>
            <Menu.Trigger aria-label={`Actions for ${email}`} />
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
      ) : null}
    </Item.Root>
  );
}

/** The signed-in account's workspaces, labelled by the account they belong to. */
function WorkspaceList() {
  const data = useUserButtonContext();
  const selectOrg = data.onSelectOrganization;
  const acceptSuggestion = data.onAcceptSuggestion;
  const acceptInvitation = data.onAcceptInvitation;
  const signOutSession = data.onSignOutSession;

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
      onClick: () => signOutSession(data.activeSession.sessionId),
    });
  }

  return (
    <Item.Group {...stylex.props(styles.scroll)}>
      <AccountRow
        email={data.activeSession.email}
        actions={actions}
      />
      {data.memberships.map(m => (
        <WorkspaceRow
          key={m.organizationId}
          shape='square'
          name={m.name}
          imageUrl={m.imageUrl}
          onSelect={selectOrg ? () => selectOrg(m.organizationId) : undefined}
          active={m.organizationId === data.activeOrganizationId}
        />
      ))}
      {data.suggestions.map(s => (
        <WorkspaceRow
          key={s.id}
          shape='square'
          name={s.name}
          imageUrl={s.imageUrl}
          trailing={
            acceptSuggestion ? (
              <Button
                variant='outline'
                color='neutral'
                size='sm'
                onClick={() => acceptSuggestion(s.id)}
              >
                Join
              </Button>
            ) : undefined
          }
        />
      ))}
      {data.invitations.map(i => (
        <WorkspaceRow
          key={i.id}
          shape='square'
          name={i.organizationName}
          imageUrl={i.imageUrl}
          trailing={
            acceptInvitation ? (
              <Button
                variant='outline'
                color='neutral'
                size='sm'
                onClick={() => acceptInvitation(i.id)}
              >
                Accept
              </Button>
            ) : undefined
          }
        />
      ))}
    </Item.Group>
  );
}

/** The other accounts this browser is signed in to. */
/**
 * With organizations the list is grouped by account, so another account reads as a heading with
 * its own menu. Without them there is nothing to head, so it is a plain row you click to switch.
 */
function AdditionalAccount({ session }: { session: UserButtonSession }) {
  const data = useUserButtonContext();
  const switchSession = data.onSwitchSession;
  const signOutSession = data.onSignOutSession;

  if (data.hasOrganizations) {
    const actions: AccountAction[] = [];
    if (switchSession) {
      actions.push({ label: 'Switch to this account', onClick: () => switchSession(session.sessionId) });
    }
    if (signOutSession) {
      actions.push({ label: 'Sign out', color: 'negative', onClick: () => signOutSession(session.sessionId) });
    }
    return (
      <AccountRow
        email={session.email}
        actions={actions}
      />
    );
  }

  return (
    <Item.Root
      size='md'
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
        <Item.Title>{session.name}</Item.Title>
        <Item.Description>{session.email}</Item.Description>
      </Item.Content>
    </Item.Root>
  );
}

function SessionsSection() {
  const data = useUserButtonContext();

  if (data.additionalSessions.length === 0) {
    return null;
  }

  return (
    <>
      <Item.Separator />
      <Item.Group>
        {data.additionalSessions.map(a => (
          <AdditionalAccount
            key={a.sessionId}
            session={a}
          />
        ))}
      </Item.Group>
    </>
  );
}

/** Account-wide actions plus the Clerk attribution. */
function Footer() {
  const data = useUserButtonContext();

  if (!data.onAddAccount && !data.onSignOutAll) {
    return <div {...stylex.props(styles.branding)}>Secured by Clerk</div>;
  }

  return (
    <>
      <Item.Separator />
      <Item.Group>
        {data.onAddAccount ? (
          <ActionRow
            icon='plus'
            label='Add account'
            onClick={data.onAddAccount}
          />
        ) : null}
        {data.onSignOutAll ? (
          <ActionRow
            icon='log-out'
            label='Sign out of all accounts'
            onClick={data.onSignOutAll}
          />
        ) : null}
      </Item.Group>
      <div {...stylex.props(styles.branding)}>Secured by Clerk</div>
    </>
  );
}

// ─── Public parts ───────────────────────────────────────────────────────────

export interface UserButtonRootProps extends UserButtonData, UserButtonCallbacks {
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
export function UserButtonRoot(props: UserButtonRootProps) {
  const { children, open, defaultOpen, onOpenChange, placement, sideOffset, ...data } = props;
  return (
    <Popover.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      placement={placement ?? 'bottom-start'}
      sideOffset={sideOffset}
    >
      <UserButtonContext.Provider value={data}>{children}</UserButtonContext.Provider>
    </Popover.Root>
  );
}

/** The trigger: the active workspace's avatar, and nothing else. */
export function UserButtonTrigger() {
  const data = useUserButtonContext();
  const org = activeMembership(data);
  const isOrg = org !== undefined;
  const name = isOrg ? org.name : data.activeSession.name;
  const imageUrl = isOrg ? org.imageUrl : data.activeSession.imageUrl;
  const shape = isOrg ? 'square' : 'circle';

  return (
    <Popover.Trigger
      aria-label={`Open account menu for ${name}`}
      {...stylex.props(styles.trigger, triggerShapes[shape])}
    >
      <WorkspaceAvatar
        name={name}
        imageUrl={imageUrl}
        shape={shape}
        size='md'
      />
    </Popover.Trigger>
  );
}

/** The popover surface: header, workspace list, additional accounts, and footer. */
export function UserButtonPopup() {
  const data = useUserButtonContext();
  return (
    <Popover.Popup aria-label='Account'>
      {/* The card lays its children out with a row gap; the rows read as one continuous list. */}
      <Card style={{ rowGap: 0 }}>
        <Header />
        {data.hasOrganizations ? (
          <>
            <Item.Separator />
            <WorkspaceList />
          </>
        ) : null}
        <SessionsSection />
        <Footer />
      </Card>
    </Popover.Popup>
  );
}

export type UserButtonProps = Omit<UserButtonRootProps, 'children'>;

/** All-in-one: renders the trigger + popup from a single prop-driven call. The headline v1 API. */
export function UserButton(props: UserButtonProps) {
  return (
    <UserButtonRoot {...props}>
      <UserButtonTrigger />
      <UserButtonPopup />
    </UserButtonRoot>
  );
}
