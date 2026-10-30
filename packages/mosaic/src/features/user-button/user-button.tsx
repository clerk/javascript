'use client';

import type { ReactElement } from 'react';

import type { SwitcherProps } from '../switcher/switcher';
import { Switcher } from '../switcher/switcher';
import type { SwitcherTriggerVariant } from '../switcher/switcher.view';

/** What the menu lists, and how much its trigger carries. */
export interface UserButtonMenuProps {
  /**
   * Whether the menu lists organizations beside accounts. `false` lists accounts alone, and never shows
   * an organization, even when one is active. The profile's shape is set by `MosaicProvider`'s `profile`.
   *
   * @default true
   */
  combined?: boolean;
  /**
   * How much the labelled trigger carries when `combined`: `full` badges the active organization with
   * the account at a larger size, `condensed` shows the lead's avatar alone. Otherwise it is always
   * `condensed`.
   *
   * @default 'full'
   */
  triggerVariant?: SwitcherTriggerVariant;
}

/** Everything `<UserButton />` takes: trigger content, and the app's own menu rows. */
export type UserButtonProps = SwitcherProps & UserButtonMenuProps;

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
 * `combined={false}` narrows the menu to the account switcher.
 * ```tsx
 * <UserButton combined={false} />
 * ```
 *
 * @example
 * `triggerVariant` trades the badged trigger for the lead's avatar alone.
 * ```tsx
 * <UserButton triggerVariant='condensed' />
 * ```
 *
 * @example
 * `afterSelectOrganizationUrl` is where switching organization lands, and takes a `:param` template,
 * a plain path, or a function. `afterSwitchSessionUrl` is where switching account lands. Set
 * `userProfileUrl` and `organizationProfileUrl` on `MosaicProvider`'s `profile` to route Settings to
 * pages of your own.
 * ```tsx
 * <UserButton
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
 * `customMenuItems` adds your own rows beside Settings, each one either an `onClick` action or an
 * `href` link. The profile's own pages are set on `MosaicProvider`'s `profile`.
 * ```tsx
 * <UserButton
 *   customMenuItems={[
 *     { id: 'docs', label: 'Documentation', icon: <BookIcon />, href: 'https://example.com/docs' },
 *     { id: 'support', label: 'Contact support', icon: <ChatIcon />, onClick: () => openSupportChat() },
 *   ]}
 *   menuItemOrder={['docs', 'support', 'settings', 'inviteMembers']}
 * />
 * ```
 */
export function UserButton({ combined = true, triggerVariant = 'full', ...props }: UserButtonProps = {}): ReactElement {
  return (
    <Switcher
      {...props}
      mode={combined ? 'combined' : 'user'}
      triggerVariant={combined ? triggerVariant : 'condensed'}
    />
  );
}
