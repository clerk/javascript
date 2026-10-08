'use client';

import type { ReactElement } from 'react';

import type { SwitcherProps } from '../switcher/switcher';
import { Switcher } from '../switcher/switcher';
import type { SwitcherMode } from '../switcher/switcher.types';

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
 * own rows to the foot of the menu, each one either an `onClick` action or an `href` link.
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
 *   menuItemOrder={['docs', 'support', 'addAccount', 'signOut']}
 * />
 * ```
 */
export function UserButton(props: UserButtonProps = {}): ReactElement {
  return (
    <Switcher
      {...props}
      mode={props.mode ?? 'combined'}
    />
  );
}
