'use client';

import type { PopoverProps } from '@clerk/headless/popover';
import type { ReactNode } from 'react';
import React from 'react';

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
// `useAccountButtonController()` output so the controller is a drop-in follow-up.

export interface AccountButtonAccount {
  sessionId: string;
  userId: string;
  name: string;
  email: string;
  imageUrl?: string;
}

export interface AccountButtonMembership {
  kind: 'membership';
  organizationId: string;
  name: string;
  imageUrl?: string;
  membersCount?: number;
  planLabel?: string;
  upgradeable?: boolean;
  membershipRequestCount?: number;
}

export interface AccountButtonSuggestion {
  kind: 'suggestion';
  id: string;
  organizationId: string;
  name: string;
  imageUrl?: string;
  status: 'pending' | 'accepted';
}

export interface AccountButtonInvitation {
  kind: 'invitation';
  id: string;
  organizationId: string;
  organizationName: string;
  imageUrl?: string;
}

export interface AccountButtonData {
  status: 'loading' | 'ready';
  activeAccount: AccountButtonAccount;
  /** `null` => the personal workspace is active. */
  activeOrganizationId: string | null;
  /** Explicit; do not derive from `memberships.length`. */
  hasOrganizations: boolean;
  memberships: AccountButtonMembership[];
  suggestions: AccountButtonSuggestion[];
  invitations: AccountButtonInvitation[];
  additionalAccounts: AccountButtonAccount[];
}

/** All optional. An unhandled action hides (or de-activates) the affordance it drives. */
export interface AccountButtonCallbacks {
  onSelectOrganization?: (organizationId: string) => void;
  onSelectPersonal?: () => void;
  onAcceptSuggestion?: (suggestionId: string) => void;
  onAcceptInvitation?: (invitationId: string) => void;
  onSwitchAccount?: (sessionId: string) => void;
  onSignOutSession?: (sessionId: string) => void;
  onSignOutAll?: () => void;
  onManageOrganization?: () => void;
  onManageMembers?: () => void;
  onManageAccount?: () => void;
  onCreateOrganization?: () => void;
  onAddAccount?: () => void;
  onUpgrade?: () => void;
}

type AccountButtonContextValue = AccountButtonData & AccountButtonCallbacks;

// ─── Recipe ───────────────────────────────────────────────────────────────────

export const accountButtonRecipe = defineSlotRecipe(theme => ({
  slots: {
    trigger: { slot: 'account-button-trigger' },
    triggerName: { slot: 'account-button-trigger-name' },
    triggerBadge: { slot: 'account-button-trigger-badge' },
    popup: { slot: 'account-button-popup' },
    header: { slot: 'account-button-header' },
    headerName: { slot: 'account-button-header-name' },
    headerActions: { slot: 'account-button-header-actions' },
    action: { slot: 'account-button-action' },
    group: { slot: 'account-button-group' },
    groupLabel: { slot: 'account-button-group-label' },
    item: { slot: 'account-button-item' },
    select: { slot: 'account-button-select' },
    name: { slot: 'account-button-name' },
    secondary: { slot: 'account-button-secondary' },
    upgrade: { slot: 'account-button-upgrade' },
    suggestedBadge: { slot: 'account-button-suggested-badge' },
    inlineButton: { slot: 'account-button-inline-button' },
    hoverAction: { slot: 'account-button-hover-action' },
    add: { slot: 'account-button-add' },
    addIcon: { slot: 'account-button-add-icon' },
    footer: { slot: 'account-button-footer' },
    signOutAll: { slot: 'account-button-sign-out-all' },
    branding: { slot: 'account-button-branding' },
    avatar: { slot: 'account-button-avatar' },
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
      '& [data-cl-slot="account-button-hover-action"]': { opacity: 0, pointerEvents: 'none' },
      '&:hover [data-cl-slot="account-button-hover-action"], &:focus-within [data-cl-slot="account-button-hover-action"]':
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
    'account-button-trigger': true;
    'account-button-trigger-name': true;
    'account-button-trigger-badge': true;
    'account-button-popup': true;
    'account-button-header': true;
    'account-button-header-name': true;
    'account-button-header-actions': true;
    'account-button-action': true;
    'account-button-group': true;
    'account-button-group-label': true;
    'account-button-item': true;
    'account-button-select': true;
    'account-button-name': true;
    'account-button-secondary': true;
    'account-button-upgrade': true;
    'account-button-suggested-badge': true;
    'account-button-inline-button': true;
    'account-button-hover-action': true;
    'account-button-add': true;
    'account-button-add-icon': true;
    'account-button-footer': true;
    'account-button-sign-out-all': true;
    'account-button-branding': true;
    'account-button-avatar': true;
  }
}

// ─── Context ────────────────────────────────────────────────────────────────

const AccountButtonContext = React.createContext<AccountButtonContextValue | null>(null);

function useAccountButtonContext(): AccountButtonContextValue {
  const ctx = React.useContext(AccountButtonContext);
  if (!ctx) {
    throw new Error('AccountButton compound components must be used within <AccountButtonRoot>');
  }
  return ctx;
}

function activeMembership(data: AccountButtonData): AccountButtonMembership | undefined {
  if (data.activeOrganizationId === null) {
    return undefined;
  }
  return data.memberships.find(m => m.organizationId === data.activeOrganizationId);
}

function membershipSubtitle(org: AccountButtonMembership): string {
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
  const { avatar } = useRecipe(accountButtonRecipe, { variants: { shape, size } });
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
  const { item, select, name: nameSlot, secondary: secondarySlot } = useRecipe(accountButtonRecipe);
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
          sx={t => ({ color: t.color.cardForeground, flexShrink: 0 })}
        />
      ) : null}
      {trailing}
      {hoverAction}
    </div>
  );
}

function SuggestedBadge() {
  const { suggestedBadge } = useRecipe(accountButtonRecipe);
  return <span {...suggestedBadge}>Suggested</span>;
}

function PendingApprovalLabel() {
  const { suggestedBadge } = useRecipe(accountButtonRecipe);
  return <span {...suggestedBadge}>Pending approval</span>;
}

function InlineButton({ label, onClick }: { label: string; onClick: () => void }) {
  const { inlineButton } = useRecipe(accountButtonRecipe);
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
  const { hoverAction } = useRecipe(accountButtonRecipe);
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
  const { add, addIcon } = useRecipe(accountButtonRecipe);
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
          sx={t => ({ color: t.color.mutedForeground })}
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
  const data = useAccountButtonContext();
  const { header, headerName, headerActions, action, secondary, upgrade } = useRecipe(accountButtonRecipe);
  const org = activeMembership(data);
  const isOrg = org !== undefined;
  const label = isOrg ? org.name : data.activeAccount.name;
  const image = isOrg ? org.imageUrl : data.activeAccount.imageUrl;

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
      actions.push({ icon: 'sign-out', label: 'Sign out', onClick: () => signOut(data.activeAccount.sessionId) });
    }
  }

  const showUpgrade = isOrg && org.upgradeable === true && data.onUpgrade !== undefined;
  const subtitle = isOrg ? membershipSubtitle(org) : data.activeAccount.email;

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
                sx={t => ({ color: t.color.cardForeground })}
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
  const data = useAccountButtonContext();
  const { group } = useRecipe(accountButtonRecipe);
  const selectOrg = data.onSelectOrganization;
  const acceptSuggestion = data.onAcceptSuggestion;
  const acceptInvitation = data.onAcceptInvitation;
  const signOutSession = data.onSignOutSession;

  return (
    <div {...group}>
      <Row
        shape='circle'
        name={data.activeAccount.name}
        secondary={data.activeAccount.email}
        imageUrl={data.activeAccount.imageUrl}
        onSelect={data.onSelectPersonal}
        active={data.activeOrganizationId === null}
        hoverAction={
          signOutSession ? <HoverAction onClick={() => signOutSession(data.activeAccount.sessionId)} /> : undefined
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
      {data.suggestions.map(s =>
        s.status === 'accepted' ? (
          <Row
            key={s.id}
            shape='square'
            name={s.name}
            imageUrl={s.imageUrl}
            trailing={<PendingApprovalLabel />}
          />
        ) : (
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
        ),
      )}
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

function AccountsSection() {
  const data = useAccountButtonContext();
  const { group, groupLabel } = useRecipe(accountButtonRecipe);
  const switchAccount = data.onSwitchAccount;

  if (data.additionalAccounts.length === 0 && !data.onAddAccount) {
    return null;
  }

  return (
    <div {...group}>
      {data.additionalAccounts.length > 0 ? <div {...groupLabel}>Additional accounts</div> : null}
      {data.additionalAccounts.map(a => (
        <Row
          key={a.sessionId}
          shape='circle'
          name={a.name}
          secondary={a.email}
          imageUrl={a.imageUrl}
          onSelect={switchAccount ? () => switchAccount(a.sessionId) : undefined}
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
  const data = useAccountButtonContext();
  const { footer, signOutAll, branding } = useRecipe(accountButtonRecipe);
  return (
    <div {...footer}>
      {data.onSignOutAll ? (
        <button
          type='button'
          onClick={data.onSignOutAll}
          {...signOutAll}
        >
          <Icon
            name='sign-out'
            size='sm'
            sx={t => ({ color: t.color.mutedForeground })}
          />
          <span>Sign out of all accounts</span>
        </button>
      ) : null}
      <div {...branding}>Secured by Clerk</div>
    </div>
  );
}

// ─── Public parts ───────────────────────────────────────────────────────────

export interface AccountButtonRootProps extends AccountButtonData, AccountButtonCallbacks {
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
export function AccountButtonRoot(props: AccountButtonRootProps) {
  const { children, open, defaultOpen, onOpenChange, placement, sideOffset, ...data } = props;
  return (
    <Popover.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      placement={placement ?? 'bottom-start'}
      sideOffset={sideOffset}
    >
      <AccountButtonContext.Provider value={data}>{children}</AccountButtonContext.Provider>
    </Popover.Root>
  );
}

/** The sidebar trigger: active workspace avatar + name (+ plan badge for orgs) and a selector icon. */
export function AccountButtonTrigger() {
  const data = useAccountButtonContext();
  const { trigger, triggerName, triggerBadge } = useRecipe(accountButtonRecipe);
  const org = activeMembership(data);
  const isOrg = org !== undefined;
  const label = isOrg ? org.name : data.activeAccount.name;
  const image = isOrg ? org.imageUrl : data.activeAccount.imageUrl;

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
            sx={t => ({ marginInlineStart: 'auto', color: t.color.mutedForeground })}
          />
        </button>
      )}
    />
  );
}

/** The popover surface: header, workspace list, additional accounts, and footer. */
export function AccountButtonPopup() {
  const data = useAccountButtonContext();
  const { popup } = useRecipe(accountButtonRecipe);
  return (
    <Popover.Portal>
      <Popover.Positioner css={{ zIndex: 50 }}>
        <Popover.Popup {...popup}>
          <Header />
          {data.hasOrganizations || data.suggestions.length > 0 || data.invitations.length > 0 ? (
            <WorkspaceList />
          ) : null}
          <AccountsSection />
          <Footer />
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  );
}

export type AccountButtonProps = Omit<AccountButtonRootProps, 'children'>;

/**
 * Presentational all-in-one: renders the trigger + popup from a single prop-driven call. The
 * connected, Clerk-backed `AccountButton` lives in `account-button.tsx` and wraps this view.
 */
export function AccountButtonView(props: AccountButtonProps) {
  return (
    <AccountButtonRoot {...props}>
      <AccountButtonTrigger />
      <AccountButtonPopup />
    </AccountButtonRoot>
  );
}
