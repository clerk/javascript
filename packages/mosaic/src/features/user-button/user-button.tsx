'use client';

import type { ReactElement } from 'react';

import { useComponentMountedTelemetry } from '../../hooks/use-component-mounted-telemetry';
import type { SwitcherProps } from '../switcher/switcher';
import { Switcher } from '../switcher/switcher';
import { switcherTelemetry } from '../switcher/switcher.telemetry';
import type { SwitcherMode } from '../switcher/switcher.types';
import type { SwitcherTriggerVariant } from '../switcher/switcher.view';

/**
 * Which switchers the surface carries. `combined` is both; `user` is an account switcher that never
 * shows an organization, even when one is active.
 */
export type UserButtonMode = Exclude<SwitcherMode, 'organization'>;

/** Which switchers the surface carries. */
export interface UserButtonModeProps {
  /**
   * Which switchers the popup carries: both, or accounts alone.
   *
   * @default 'combined'
   */
  mode?: UserButtonMode;
  /**
   * How much the labelled trigger carries in `combined` mode: `full` badges the active organization
   * with the account at a larger size, `condensed` shows the lead's avatar alone. `user` mode is
   * always `condensed`.
   *
   * @default 'full'
   */
  triggerVariant?: SwitcherTriggerVariant;
}

/** Everything `<UserButton />` takes: profile routing, trigger content, the app's own menu rows, and the profiles it opens. */
export type UserButtonProps = SwitcherProps & UserButtonModeProps;

/**
 * The signed-in user's avatar, and the menu behind it: switch organization, switch or add an account,
 * open the profile, and sign out. It reads the active session and organization from Clerk, so it takes
 * no data. It renders `fallback` until Clerk answers, and nothing at all when nobody is signed in.
 *
 * Each action is a request: the row you click spins, the others stand down, and the menu stays open on
 * the result. Only an action that navigates closes it.
 *
 * @example
 * ```tsx
 * import { UserButton } from '@clerk/mosaic';
 *
 * <UserButton />
 * ```
 *
 * @example
 * `mode` narrows the menu to the account switcher.
 * ```tsx
 * <UserButton mode='user' />
 * ```
 *
 * @example
 * `triggerVariant` trades the badged trigger for the lead's avatar alone.
 * ```tsx
 * <UserButton triggerVariant='condensed' />
 * ```
 *
 * @example
 * Passing a URL routes to a page of your own instead of opening Clerk's modal; that is the whole
 * opt-in. `afterSelectOrganizationUrl` is where switching organization lands, and takes a `:param`
 * template, a plain path, or a function. `afterSwitchSessionUrl` is where switching account lands.
 * ```tsx
 * <UserButton
 *   userProfileUrl='/account'
 *   organizationProfileUrl='/settings/organization'
 *   afterSelectOrganizationUrl='/orgs/:slug'
 *   afterSwitchSessionUrl='/dashboard'
 * />
 * ```
 *
 * @example
 * `fallback` holds the space while Clerk is still answering. Size it to the trigger to keep the row
 * it sits in from moving. Nothing stands in once the answer is that nobody is signed in.
 * ```tsx
 * <UserButton fallback={<AvatarSkeleton />} />
 * ```
 *
 * @example
 * `customPages` adds your own pages to either profile this button opens; `customMenuItems` adds your
 * own rows beside Settings, each one either an `onClick` action or an `href` link.
 * ```tsx
 * <UserButton
 *   userProfileProps={{
 *     customPages: [{ path: 'usage', label: 'Usage', icon: <ChartIcon />, content: <UsagePage /> }],
 *     pageOrder: ['account', 'usage', 'security'],
 *   }}
 *   organizationProfileProps={{
 *     customPages: [{ path: 'audit', label: 'Audit log', icon: <ListIcon />, content: <AuditPage /> }],
 *     pageOrder: ['general', 'members', 'audit'],
 *   }}
 *   customMenuItems={[
 *     { id: 'docs', label: 'Documentation', icon: <BookIcon />, href: 'https://example.com/docs' },
 *     { id: 'support', label: 'Contact support', icon: <ChatIcon />, onClick: () => openSupportChat() },
 *   ]}
 *   menuItemOrder={['docs', 'support', 'settings', 'inviteMembers']}
 * />
 * ```
 */
export function UserButton({ mode, triggerVariant = 'full', ...props }: UserButtonProps = {}): ReactElement {
  const combined = mode !== 'user';
  const switcherMode = combined ? 'combined' : 'user';
  const resolvedTriggerVariant = combined ? triggerVariant : 'condensed';
  useComponentMountedTelemetry('UserButton', {
    ...switcherTelemetry(props),
    mode: switcherMode,
    triggerVariant: resolvedTriggerVariant,
    userProfileMode: props.userProfileUrl ? 'navigation' : 'modal',
    userProfileCustomPages: props.userProfileProps?.customPages?.length ?? 0,
  });

  return (
    <Switcher
      {...props}
      mode={switcherMode}
      triggerVariant={resolvedTriggerVariant}
    />
  );
}
