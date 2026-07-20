'use client';

import type { PopoverProps } from '@clerk/headless/popover';
import type { ReactNode } from 'react';
import React from 'react';

import { Icon } from '../components/icon';
import { Skeleton } from '../components/skeleton';
import { Spinner } from '../components/spinner';
import type { IconName } from '../icons/registry';
import { Popover } from '../primitives/popover';
import { useRecipe } from '../slot-recipe';
import { accountButtonRecipe } from './account-button.recipe';
import {
  accountBusyKeys,
  type AccountButtonBusyState,
  type AccountButtonCallbacks,
  type AccountButtonData,
  type AccountButtonMembership,
} from './account-button.types';

type AccountButtonContextValue = AccountButtonData & AccountButtonCallbacks & AccountButtonBusyState;

// ─── Context ────────────────────────────────────────────────────────────────

const AccountButtonContext = React.createContext<AccountButtonContextValue | null>(null);

function useAccountButtonContext(): AccountButtonContextValue {
  const ctx = React.useContext(AccountButtonContext);
  if (!ctx) {
    throw new Error('AccountButton compound components must be used within <AccountButtonRoot>');
  }
  return ctx;
}

interface BusyState {
  loading: boolean;
  disabled: boolean;
}

/** A key-less affordance (navigation) is disabled whenever anything is pending, never `loading`. */
function resolveBusy(pendingKey: string | null | undefined, key?: string): BusyState {
  const busy = pendingKey !== null && pendingKey !== undefined;
  return { loading: key !== undefined && pendingKey === key, disabled: busy && pendingKey !== key };
}

function useBusy(key?: string): BusyState {
  const { pendingKey } = useAccountButtonContext();
  return resolveBusy(pendingKey, key);
}

type BusySlot = 'inlineButton' | 'hoverAction' | 'action' | 'signOutAll';

/**
 * A button whose action can be in flight: swaps `leading` for a spinner while `busyKey` is the pending
 * action, and disables itself whenever any action is pending. `children` persist across the swap.
 */
function BusyButton({
  slot,
  busyKey,
  onClick,
  leading,
  children,
}: {
  slot: BusySlot;
  busyKey?: string;
  onClick: () => void;
  leading?: ReactNode;
  children?: ReactNode;
}) {
  const recipe = useRecipe(accountButtonRecipe);
  const { loading, disabled } = useBusy(busyKey);
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={loading || disabled}
      {...recipe[slot]}
    >
      {loading ? <Spinner /> : leading}
      {children}
    </button>
  );
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
  /** Key for this row's own select action; drives its spinner/disabled state. */
  busyKey?: string;
}

function Row({ name, secondary, shape, imageUrl, onSelect, active, badge, trailing, hoverAction, busyKey }: RowProps) {
  const { item, select, name: nameSlot, secondary: secondarySlot } = useRecipe(accountButtonRecipe);
  const { loading, disabled } = useBusy(busyKey);
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
          disabled={loading || disabled}
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
      {loading ? (
        <Spinner />
      ) : active ? (
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

function AddRow({ label, onClick }: { label: string; onClick: () => void }) {
  const { add, addIcon } = useRecipe(accountButtonRecipe);
  const { disabled } = useBusy();
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
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
  busyKey?: string;
}

function Header() {
  const data = useAccountButtonContext();
  const { header, headerName, headerActions, secondary, upgrade } = useRecipe(accountButtonRecipe);
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
      actions.push({
        icon: 'sign-out',
        label: 'Sign out',
        onClick: () => signOut(data.activeAccount.sessionId),
        busyKey: accountBusyKeys.signOutSession(data.activeAccount.sessionId),
      });
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
                  disabled={resolveBusy(data.pendingKey).disabled}
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
            <BusyButton
              key={a.label}
              slot='action'
              onClick={a.onClick}
              busyKey={a.busyKey}
              leading={
                <Icon
                  name={a.icon}
                  size='sm'
                  sx={t => ({ color: t.color.cardForeground })}
                />
              }
            >
              {a.label}
            </BusyButton>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function WorkspaceList() {
  const data = useAccountButtonContext();
  const { group, scroll, loadMore } = useRecipe(accountButtonRecipe);
  const selectOrg = data.onSelectOrganization;
  const acceptSuggestion = data.onAcceptSuggestion;
  const acceptInvitation = data.onAcceptInvitation;
  const signOutSession = data.onSignOutSession;

  return (
    <div {...group}>
      <div {...scroll}>
        <Row
          shape='circle'
          name={data.activeAccount.name}
          secondary={data.activeAccount.email}
          imageUrl={data.activeAccount.imageUrl}
          onSelect={data.onSelectPersonal}
          active={data.activeOrganizationId === null}
          busyKey={accountBusyKeys.selectPersonal()}
          hoverAction={
            signOutSession ? (
              <BusyButton
                slot='hoverAction'
                leading='Sign out'
                onClick={() => signOutSession(data.activeAccount.sessionId)}
                busyKey={accountBusyKeys.signOutSession(data.activeAccount.sessionId)}
              />
            ) : undefined
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
            busyKey={accountBusyKeys.selectOrganization(m.organizationId)}
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
                  <BusyButton
                    slot='inlineButton'
                    leading='Join'
                    onClick={() => acceptSuggestion(s.id)}
                    busyKey={accountBusyKeys.acceptSuggestion(s.id)}
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
                <BusyButton
                  slot='inlineButton'
                  leading='Accept'
                  onClick={() => acceptInvitation(i.id)}
                  busyKey={accountBusyKeys.acceptInvitation(i.id)}
                />
              ) : undefined
            }
          />
        ))}
        <div
          ref={data.loadMoreRef}
          aria-hidden
        >
          {data.hasMoreRows || data.isFetchingRows ? (
            <div {...loadMore}>
              <Spinner />
            </div>
          ) : null}
        </div>
      </div>
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
          busyKey={accountBusyKeys.switchAccount(a.sessionId)}
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
  const { footer, branding } = useRecipe(accountButtonRecipe);
  return (
    <div {...footer}>
      {data.onSignOutAll ? (
        <BusyButton
          slot='signOutAll'
          onClick={data.onSignOutAll}
          busyKey={accountBusyKeys.signOutAll()}
          leading={
            <Icon
              name='sign-out'
              size='sm'
              sx={t => ({ color: t.color.mutedForeground })}
            />
          }
        >
          <span>Sign out of all accounts</span>
        </BusyButton>
      ) : null}
      <div {...branding}>Secured by Clerk</div>
    </div>
  );
}

// ─── Public parts ───────────────────────────────────────────────────────────

export interface AccountButtonRootProps extends AccountButtonData, AccountButtonCallbacks, AccountButtonBusyState {
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

/**
 * Placeholder shown in the trigger's slot while the controller loads, so the sidebar reserves the
 * trigger's space and nothing shifts when the real avatar/name land. Non-interactive.
 */
export function AccountButtonTriggerSkeleton() {
  const { trigger } = useRecipe(accountButtonRecipe);
  return (
    <div
      {...trigger}
      data-cl-loading=''
      css={{ ...trigger.css, cursor: 'default' }}
    >
      <Skeleton
        width='1.25rem'
        height='1.25rem'
        sx={t => ({ borderRadius: t.rounded.full, flexShrink: 0 })}
      />
      <Skeleton
        width='7rem'
        height='0.875rem'
      />
    </div>
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

export type AccountButtonViewProps = Omit<AccountButtonRootProps, 'children'>;

/**
 * Presentational all-in-one: renders the trigger + popup from a single prop-driven call. The
 * connected, Clerk-backed `AccountButton` lives in `account-button.tsx` and wraps this view.
 */
export function AccountButtonView(props: AccountButtonViewProps) {
  return (
    <AccountButtonRoot {...props}>
      <AccountButtonTrigger />
      <AccountButtonPopup />
    </AccountButtonRoot>
  );
}
