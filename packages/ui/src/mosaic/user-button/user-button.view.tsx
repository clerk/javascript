'use client';

import type { PopoverProps } from '@clerk/headless/popover';
import type { ReactNode } from 'react';
import React from 'react';

import { useMosaicTheme } from '../MosaicProvider';
import { Icon } from '../components/icon';
import type { IconName } from '../icons/registry';
import { Popover } from '../primitives/popover';
import { defineSlotRecipe, useRecipe } from '../slot-recipe';

// Prototype accent (Clerk brand purple) for the plan badge and the Upgrade link. The neutral
// Mosaic palette has no accent token yet; swap these for a token once one lands.
const ACCENT = '#6c47ff';
const ACCENT_SOFT = 'color-mix(in oklab, #6c47ff 14%, transparent)';

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

// ─── Recipe ───────────────────────────────────────────────────────────────────

export const userButtonRecipe = defineSlotRecipe(theme => ({
  slots: {
    trigger: { slot: 'user-button-trigger' },
    triggerName: { slot: 'user-button-trigger-name' },
    triggerBadge: { slot: 'user-button-trigger-badge' },
    popup: { slot: 'user-button-popup' },
    header: { slot: 'user-button-header' },
    headerName: { slot: 'user-button-header-name' },
    headerActions: { slot: 'user-button-header-actions' },
    action: { slot: 'user-button-action' },
    group: { slot: 'user-button-group' },
    groupLabel: { slot: 'user-button-group-label' },
    item: { slot: 'user-button-item' },
    select: { slot: 'user-button-select' },
    name: { slot: 'user-button-name' },
    secondary: { slot: 'user-button-secondary' },
    upgrade: { slot: 'user-button-upgrade' },
    suggestedBadge: { slot: 'user-button-suggested-badge' },
    inlineButton: { slot: 'user-button-inline-button' },
    hoverAction: { slot: 'user-button-hover-action' },
    add: { slot: 'user-button-add' },
    addIcon: { slot: 'user-button-add-icon' },
    footer: { slot: 'user-button-footer' },
    signOutAll: { slot: 'user-button-sign-out-all' },
    branding: { slot: 'user-button-branding' },
    avatar: { slot: 'user-button-avatar' },
  },
  base: {
    trigger: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(2),
      width: '100%',
      minWidth: 0,
      padding: `${theme.spacing(1.5)} ${theme.spacing(2)}`,
      borderRadius: theme.rounded.md,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'start',
      color: theme.color.cardForeground,
      ...theme.text('sm'),
      _hover: { backgroundColor: theme.color.muted },
    },
    triggerName: {
      fontWeight: theme.font.medium,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    triggerBadge: {
      flexShrink: 0,
      ...theme.text('xs'),
      fontWeight: theme.font.medium,
      padding: `${theme.spacing(0.5)} ${theme.spacing(1.5)}`,
      borderRadius: theme.rounded.full,
      backgroundColor: ACCENT_SOFT,
      color: ACCENT,
      whiteSpace: 'nowrap',
    },
    popup: {
      width: '20rem',
      maxWidth: 'calc(100vw - 2rem)',
      backgroundColor: theme.color.card,
      color: theme.color.cardForeground,
      border: `1px solid ${theme.color.border}`,
      borderRadius: theme.rounded.lg,
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
      overflow: 'hidden',
      ...theme.text('sm'),
    },
    header: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(3),
      padding: theme.spacing(4),
    },
    headerName: {
      ...theme.text('sm'),
      fontWeight: theme.font.semibold,
      color: theme.color.cardForeground,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    headerActions: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: theme.spacing(2),
    },
    action: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing(2),
      padding: theme.spacing(2),
      borderRadius: theme.rounded.md,
      border: `1px solid ${theme.color.border}`,
      background: theme.color.card,
      color: theme.color.cardForeground,
      ...theme.text('sm'),
      fontWeight: theme.font.medium,
      cursor: 'pointer',
      _hover: { backgroundColor: theme.color.muted },
    },
    group: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(0.5),
      padding: theme.spacing(1.5),
      borderTop: `1px solid ${theme.color.border}`,
    },
    groupLabel: {
      padding: `${theme.spacing(1.5)} ${theme.spacing(2)} ${theme.spacing(1)}`,
      ...theme.text('xs'),
      fontWeight: theme.font.medium,
      color: theme.color.mutedForeground,
    },
    item: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(2),
      padding: theme.spacing(2),
      borderRadius: theme.rounded.md,
      position: 'relative',
      _hover: { backgroundColor: theme.color.muted },
      // Hover-reveal sign out: hidden but focusable (kept in tab order); revealed on row hover
      // or keyboard focus-within — never a bare `opacity: 0` that would strand the focused button.
      '& [data-cl-slot="user-button-hover-action"]': { opacity: 0, pointerEvents: 'none' },
      '&:hover [data-cl-slot="user-button-hover-action"], &:focus-within [data-cl-slot="user-button-hover-action"]':
        { opacity: 1, pointerEvents: 'auto' },
    },
    select: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(3),
      flex: 1,
      minWidth: 0,
      background: 'none',
      border: 'none',
      padding: 0,
      margin: 0,
      font: 'inherit',
      color: 'inherit',
      textAlign: 'start',
      cursor: 'pointer',
    },
    name: {
      ...theme.text('sm'),
      fontWeight: theme.font.medium,
      color: theme.color.cardForeground,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    secondary: {
      ...theme.text('xs'),
      color: theme.color.mutedForeground,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    upgrade: {
      background: 'none',
      border: 'none',
      padding: 0,
      font: 'inherit',
      cursor: 'pointer',
      color: ACCENT,
      fontWeight: theme.font.medium,
    },
    suggestedBadge: {
      flexShrink: 0,
      ...theme.text('xs'),
      color: theme.color.mutedForeground,
      padding: `${theme.spacing(0.5)} ${theme.spacing(1.5)}`,
      borderRadius: theme.rounded.sm,
      backgroundColor: theme.color.muted,
      whiteSpace: 'nowrap',
    },
    inlineButton: {
      flexShrink: 0,
      ...theme.text('xs'),
      fontWeight: theme.font.medium,
      padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
      borderRadius: theme.rounded.md,
      border: `1px solid ${theme.color.border}`,
      background: theme.color.card,
      color: theme.color.cardForeground,
      cursor: 'pointer',
      _hover: { backgroundColor: theme.color.muted },
    },
    hoverAction: {
      flexShrink: 0,
      ...theme.text('xs'),
      fontWeight: theme.font.medium,
      padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
      borderRadius: theme.rounded.md,
      border: `1px solid ${theme.color.border}`,
      background: theme.color.card,
      color: theme.color.cardForeground,
      cursor: 'pointer',
      transition: 'opacity 120ms ease',
      _hover: { backgroundColor: theme.color.muted },
    },
    add: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(3),
      width: '100%',
      padding: theme.spacing(2),
      borderRadius: theme.rounded.md,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'start',
      ...theme.text('sm'),
      color: theme.color.mutedForeground,
      _hover: { backgroundColor: theme.color.muted },
    },
    addIcon: {
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0,
      width: theme.spacing(9),
      height: theme.spacing(9),
      borderRadius: theme.rounded.full,
      backgroundColor: theme.color.muted,
      color: theme.color.mutedForeground,
    },
    footer: {
      display: 'flex',
      flexDirection: 'column',
      borderTop: `1px solid ${theme.color.border}`,
      padding: theme.spacing(1.5),
    },
    signOutAll: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(3),
      width: '100%',
      padding: theme.spacing(2),
      borderRadius: theme.rounded.md,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'start',
      ...theme.text('sm'),
      color: theme.color.mutedForeground,
      _hover: { backgroundColor: theme.color.muted },
    },
    branding: {
      marginTop: theme.spacing(1),
      padding: theme.spacing(2),
      borderTop: `1px solid ${theme.color.border}`,
      textAlign: 'center',
      ...theme.text('xs'),
      color: theme.color.mutedForeground,
    },
    avatar: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      overflow: 'hidden',
      fontWeight: theme.font.medium,
      textTransform: 'uppercase',
      lineHeight: 1,
      '& > img': { width: '100%', height: '100%', objectFit: 'cover' },
    },
  },
  variants: {
    shape: {
      square: {
        avatar: {
          borderRadius: theme.rounded.md,
          backgroundColor: theme.color.primary,
          color: theme.color.primaryForeground,
        },
      },
      circle: {
        avatar: {
          borderRadius: theme.rounded.full,
          backgroundColor: theme.color.muted,
          color: theme.color.mutedForeground,
        },
      },
    },
    size: {
      sm: { avatar: { width: theme.spacing(5), height: theme.spacing(5), ...theme.text('xs') } },
      md: { avatar: { width: theme.spacing(9), height: theme.spacing(9), ...theme.text('sm') } },
    },
  },
  defaultVariants: { shape: 'circle', size: 'md' },
}));

declare module '../registry' {
  interface MosaicSlotRegistry {
    'user-button-trigger': true;
    'user-button-trigger-name': true;
    'user-button-trigger-badge': true;
    'user-button-popup': true;
    'user-button-header': true;
    'user-button-header-name': true;
    'user-button-header-actions': true;
    'user-button-action': true;
    'user-button-group': true;
    'user-button-group-label': true;
    'user-button-item': true;
    'user-button-select': true;
    'user-button-name': true;
    'user-button-secondary': true;
    'user-button-upgrade': true;
    'user-button-suggested-badge': true;
    'user-button-inline-button': true;
    'user-button-hover-action': true;
    'user-button-add': true;
    'user-button-add-icon': true;
    'user-button-footer': true;
    'user-button-sign-out-all': true;
    'user-button-branding': true;
    'user-button-avatar': true;
  }
}

// ─── Context ────────────────────────────────────────────────────────────────

const UserButtonContext = React.createContext<UserButtonContextValue | null>(null);

function useUserButtonContext(): UserButtonContextValue {
  const ctx = React.useContext(UserButtonContext);
  if (!ctx) {
    throw new Error('UserButton compound components must be used within <UserButtonRoot>');
  }
  return ctx;
}

function activeMembership(data: UserButtonData): UserButtonMembership | undefined {
  if (data.activeOrganizationId === null) {
    return undefined;
  }
  return data.memberships.find(m => m.organizationId === data.activeOrganizationId);
}

function membershipSubtitle(org: UserButtonMembership): string {
  const parts: string[] = [];
  if (org.membersCount !== undefined) {
    parts.push(`${org.membersCount} members`);
  }
  if (org.planLabel) {
    parts.push(org.planLabel);
  }
  return parts.join(' · ');
}

// ─── Presentational leaves ────────────────────────────────────────────────────

type AvatarShape = 'square' | 'circle';

function Avatar({
  name,
  imageUrl,
  shape,
  size,
}: {
  name: string;
  imageUrl?: string;
  shape: AvatarShape;
  size: 'sm' | 'md';
}) {
  const { avatar } = useRecipe(userButtonRecipe, { variants: { shape, size } });
  return (
    <span {...avatar}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=''
        />
      ) : (
        name.trim().charAt(0)
      )}
    </span>
  );
}

interface RowProps {
  name: string;
  secondary?: string;
  shape: AvatarShape;
  imageUrl?: string;
  onSelect?: () => void;
  active?: boolean;
  badge?: ReactNode;
  trailing?: ReactNode;
  hoverAction?: ReactNode;
}

function Row({ name, secondary, shape, imageUrl, onSelect, active, badge, trailing, hoverAction }: RowProps) {
  const theme = useMosaicTheme();
  const { item, select, name: nameSlot, secondary: secondarySlot } = useRecipe(userButtonRecipe);
  const inner = (
    <>
      <Avatar
        name={name}
        imageUrl={imageUrl}
        shape={shape}
        size='md'
      />
      <span css={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
        <span css={{ display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: 0 }}>
          <span {...nameSlot}>{name}</span>
          {badge}
        </span>
        {secondary ? <span {...secondarySlot}>{secondary}</span> : null}
      </span>
    </>
  );
  return (
    <div {...item}>
      {onSelect ? (
        <button
          type='button'
          onClick={onSelect}
          {...select}
        >
          {inner}
        </button>
      ) : (
        <div
          {...select}
          style={{ cursor: 'default' }}
        >
          {inner}
        </div>
      )}
      {active ? (
        <Icon
          name='check'
          size='sm'
          style={{ color: theme.color.cardForeground, flexShrink: 0 }}
        />
      ) : null}
      {trailing}
      {hoverAction}
    </div>
  );
}

function SuggestedBadge() {
  const { suggestedBadge } = useRecipe(userButtonRecipe);
  return <span {...suggestedBadge}>Suggested</span>;
}

function InlineButton({ label, onClick }: { label: string; onClick: () => void }) {
  const { inlineButton } = useRecipe(userButtonRecipe);
  return (
    <button
      type='button'
      onClick={onClick}
      {...inlineButton}
    >
      {label}
    </button>
  );
}

function HoverAction({ onClick }: { onClick: () => void }) {
  const { hoverAction } = useRecipe(userButtonRecipe);
  return (
    <button
      type='button'
      onClick={onClick}
      {...hoverAction}
    >
      Sign out
    </button>
  );
}

function AddRow({ label, onClick }: { label: string; onClick: () => void }) {
  const theme = useMosaicTheme();
  const { add, addIcon } = useRecipe(userButtonRecipe);
  return (
    <button
      type='button'
      onClick={onClick}
      {...add}
    >
      <span {...addIcon}>
        <Icon
          name='plus'
          size='sm'
          style={{ color: theme.color.mutedForeground }}
        />
      </span>
      <span>{label}</span>
    </button>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

interface HeaderAction {
  icon: IconName;
  label: string;
  onClick: () => void;
}

function Header() {
  const theme = useMosaicTheme();
  const data = useUserButtonContext();
  const { header, headerName, headerActions, action, secondary, upgrade } = useRecipe(userButtonRecipe);
  const org = activeMembership(data);
  const isOrg = org !== undefined;
  const label = isOrg ? org.name : data.activeSession.name;
  const image = isOrg ? org.imageUrl : data.activeSession.imageUrl;

  const actions: HeaderAction[] = [];
  if (isOrg) {
    if (data.onManageOrganization) {
      actions.push({ icon: 'cog', label: 'Settings', onClick: data.onManageOrganization });
    }
    if (data.onManageMembers) {
      actions.push({ icon: 'users', label: 'Members', onClick: data.onManageMembers });
    }
  } else {
    if (data.onManageAccount) {
      actions.push({ icon: 'cog', label: 'Manage account', onClick: data.onManageAccount });
    }
    const signOut = data.onSignOutSession;
    if (signOut) {
      actions.push({ icon: 'log-out', label: 'Sign out', onClick: () => signOut(data.activeSession.sessionId) });
    }
  }

  const showUpgrade = isOrg && org.upgradeable === true && data.onUpgrade !== undefined;
  const subtitle = isOrg ? membershipSubtitle(org) : data.activeSession.email;

  return (
    <div {...header}>
      <div css={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
        <Avatar
          name={label}
          imageUrl={image}
          shape={isOrg ? 'square' : 'circle'}
          size='md'
        />
        <span css={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
          <span {...headerName}>{label}</span>
          <span {...secondary}>
            {subtitle}
            {showUpgrade ? (
              <>
                {subtitle ? ' · ' : null}
                <button
                  type='button'
                  onClick={data.onUpgrade}
                  {...upgrade}
                >
                  Upgrade
                </button>
              </>
            ) : null}
          </span>
        </span>
      </div>
      {actions.length > 0 ? (
        <div
          {...headerActions}
          style={{ gridTemplateColumns: `repeat(${actions.length}, 1fr)` }}
        >
          {actions.map(a => (
            <button
              key={a.label}
              type='button'
              onClick={a.onClick}
              {...action}
            >
              <Icon
                name={a.icon}
                size='sm'
                style={{ color: theme.color.cardForeground }}
              />
              {a.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function WorkspaceList() {
  const data = useUserButtonContext();
  const { group } = useRecipe(userButtonRecipe);
  const selectOrg = data.onSelectOrganization;
  const acceptSuggestion = data.onAcceptSuggestion;
  const acceptInvitation = data.onAcceptInvitation;
  const signOutSession = data.onSignOutSession;

  return (
    <div {...group}>
      <Row
        shape='circle'
        name={data.activeSession.name}
        secondary={data.activeSession.email}
        imageUrl={data.activeSession.imageUrl}
        onSelect={data.onSelectPersonal}
        active={data.activeOrganizationId === null}
        hoverAction={
          signOutSession ? <HoverAction onClick={() => signOutSession(data.activeSession.sessionId)} /> : undefined
        }
      />
      {data.memberships.map(m => (
        <Row
          key={m.organizationId}
          shape='square'
          name={m.name}
          imageUrl={m.imageUrl}
          onSelect={selectOrg ? () => selectOrg(m.organizationId) : undefined}
          active={m.organizationId === data.activeOrganizationId}
        />
      ))}
      {data.suggestions.map(s => (
        <Row
          key={s.id}
          shape='square'
          name={s.name}
          imageUrl={s.imageUrl}
          badge={<SuggestedBadge />}
          trailing={
            acceptSuggestion ? (
              <InlineButton
                label='Join'
                onClick={() => acceptSuggestion(s.id)}
              />
            ) : undefined
          }
        />
      ))}
      {data.invitations.map(i => (
        <Row
          key={i.id}
          shape='square'
          name={i.organizationName}
          imageUrl={i.imageUrl}
          trailing={
            acceptInvitation ? (
              <InlineButton
                label='Accept'
                onClick={() => acceptInvitation(i.id)}
              />
            ) : undefined
          }
        />
      ))}
      {data.onCreateOrganization ? (
        <AddRow
          label='Add organization'
          onClick={data.onCreateOrganization}
        />
      ) : null}
    </div>
  );
}

function SessionsSection() {
  const data = useUserButtonContext();
  const { group, groupLabel } = useRecipe(userButtonRecipe);
  const switchSession = data.onSwitchSession;

  if (data.additionalSessions.length === 0 && !data.onAddAccount) {
    return null;
  }

  return (
    <div {...group}>
      {data.additionalSessions.length > 0 ? <div {...groupLabel}>Additional accounts</div> : null}
      {data.additionalSessions.map(a => (
        <Row
          key={a.sessionId}
          shape='circle'
          name={a.name}
          secondary={a.email}
          imageUrl={a.imageUrl}
          onSelect={switchSession ? () => switchSession(a.sessionId) : undefined}
        />
      ))}
      {data.onAddAccount ? (
        <AddRow
          label='Add account'
          onClick={data.onAddAccount}
        />
      ) : null}
    </div>
  );
}

function Footer() {
  const theme = useMosaicTheme();
  const data = useUserButtonContext();
  const { footer, signOutAll, branding } = useRecipe(userButtonRecipe);
  return (
    <div {...footer}>
      {data.onSignOutAll ? (
        <button
          type='button'
          onClick={data.onSignOutAll}
          {...signOutAll}
        >
          <Icon
            name='log-out'
            size='sm'
            style={{ color: theme.color.mutedForeground }}
          />
          <span>Sign out of all accounts</span>
        </button>
      ) : null}
      <div {...branding}>Secured by Clerk</div>
    </div>
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

/** The sidebar trigger: active workspace avatar + name (+ plan badge for orgs) and a selector icon. */
export function UserButtonTrigger() {
  const theme = useMosaicTheme();
  const data = useUserButtonContext();
  const { trigger, triggerName, triggerBadge } = useRecipe(userButtonRecipe);
  const org = activeMembership(data);
  const isOrg = org !== undefined;
  const label = isOrg ? org.name : data.activeSession.name;
  const image = isOrg ? org.imageUrl : data.activeSession.imageUrl;

  return (
    <Popover.Trigger
      render={({ ref, ...triggerProps }) => (
        <button
          ref={ref}
          type='button'
          {...triggerProps}
          {...trigger}
        >
          <Avatar
            name={label}
            imageUrl={image}
            shape={isOrg ? 'square' : 'circle'}
            size='sm'
          />
          <span {...triggerName}>{label}</span>
          {isOrg && org.planLabel ? <span {...triggerBadge}>{org.planLabel}</span> : null}
          <Icon
            name='chevron-up-down'
            size='sm'
            style={{ marginInlineStart: 'auto', color: theme.color.mutedForeground }}
          />
        </button>
      )}
    />
  );
}

/** The popover surface: header, workspace list, additional accounts, and footer. */
export function UserButtonPopup() {
  const data = useUserButtonContext();
  const { popup } = useRecipe(userButtonRecipe);
  return (
    <Popover.Portal>
      <Popover.Positioner css={{ zIndex: 50 }}>
        <Popover.Popup {...popup}>
          <Header />
          {data.hasOrganizations ? <WorkspaceList /> : null}
          <SessionsSection />
          <Footer />
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
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
