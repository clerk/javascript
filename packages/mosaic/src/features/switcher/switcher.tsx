'use client';

import type { ReactElement, ReactNode } from 'react';

import { useMosaicProfile } from '../profile-pages/use-mosaic-profile';
import { useSwitcherController } from './switcher.controller';
import type {
  OrganizationSwitcherModelOptions,
  SwitcherModelOptions,
  UserSwitcherModelOptions,
} from './switcher.model';
import { useSwitcherModel } from './switcher.model';
import { useCustomPages, useOrganizationProfilePages, useUserProfilePages } from './switcher.pages';
import type { SwitcherMenuProps, SwitcherMode } from './switcher.types';
import type { SwitcherTriggerProps, SwitcherTriggerVariant } from './switcher.view';
import { SwitcherView } from './switcher.view';

type SwitcherBaseProps = SwitcherTriggerProps &
  SwitcherMenuProps & {
    /**
     * Fallback while loading.
     *
     * Note that the component renders nothing when the user is signed out, so using this on
     * pages that are reachable while both signed-out and signed-in can result in Fallback->Nothing.
     */
    fallback?: ReactNode;
  };

/** Everything `<Switcher />` takes in `combined` mode. */
export type CombinedSwitcherProps = SwitcherBaseProps &
  SwitcherModelOptions & {
    /**
     * How much the labelled trigger carries: `full` badges the active organization with the account at a
     * larger size, `condensed` shows the lead's avatar alone.
     *
     * @default 'full'
     */
    triggerVariant?: SwitcherTriggerVariant;
  };

/** Everything `<UserButton />`, or `<Switcher mode='user' />`, takes. */
export type UserButtonProps = SwitcherBaseProps & UserSwitcherModelOptions;

/** Everything `<OrganizationSwitcher />`, or `<Switcher mode='organization' />`, takes. */
export type OrganizationSwitcherProps = SwitcherBaseProps & OrganizationSwitcherModelOptions;

/**
 * What the menu lists, and the options that apply to it. `combined` lists accounts and organizations,
 * `user` lists accounts alone and never an organization, even when one is active, and `organization`
 * lists organizations and the personal account. A mode chosen at runtime takes only the props every
 * mode shares. The profile's shape is set by `MosaicProvider`'s `profile`.
 */
export type SwitcherProps =
  | ({ mode?: 'combined' } & CombinedSwitcherProps)
  | ({ mode: 'user'; triggerVariant?: never } & UserButtonProps)
  | ({ mode: 'organization'; triggerVariant?: never } & OrganizationSwitcherProps)
  | ({ mode: SwitcherMode } & SwitcherBaseProps & { [K in keyof SwitcherModelOptions | 'triggerVariant']?: never });

/**
 * The signed-in user's avatar, and the menu behind it: switch organization, switch or add an account,
 * open the profile, and sign out. `mode` narrows the menu to accounts or to organizations. It reads the
 * active session and organization from Clerk, so it takes no data. It renders `fallback` until Clerk
 * answers, and nothing at all when nobody is signed in.
 *
 * Each action is a request: the row you click spins, the others stand down, and the menu stays open on
 * the result. Only an action that navigates closes it.
 *
 * @example
 * ```tsx
 * import { Switcher } from '@clerk/mosaic';
 *
 * <Switcher />
 * ```
 *
 * @example
 * `mode` narrows the menu. `<UserButton />` and `<OrganizationSwitcher />` are the same as
 * `mode='user'` and `mode='organization'`.
 * ```tsx
 * <Switcher mode='user' />
 * <Switcher mode='organization' hidePersonal />
 * ```
 *
 * @example
 * `triggerVariant` trades the badged trigger for the lead's avatar alone. It applies to the combined
 * menu only; the other modes always show the avatar alone.
 * ```tsx
 * <Switcher triggerVariant='condensed' />
 * ```
 *
 * @example
 * `afterSelectOrganizationUrl` is where switching organization lands, and takes a `:param` template,
 * a plain path, or a function. `afterSwitchSessionUrl` is where switching account lands. Set
 * `userProfileUrl` and `organizationProfileUrl` on `MosaicProvider`'s `profile` to route Settings to
 * pages of your own.
 * ```tsx
 * <Switcher
 *   afterSelectOrganizationUrl='/orgs/:slug'
 *   afterSwitchSessionUrl='/dashboard'
 * />
 * ```
 *
 * @example
 * `fallback` holds the space while Clerk is still answering. Size it to the trigger to keep the row
 * it sits in from moving. Nothing stands in once the answer is that nobody is signed in.
 * ```tsx
 * <Switcher fallback={<AvatarSkeleton />} />
 * ```
 *
 * @example
 * `customMenuItems` adds your own rows beside Settings, each one either an `onClick` action or an
 * `href` link. The profile's own pages are set on `MosaicProvider`'s `profile`.
 * ```tsx
 * <Switcher
 *   customMenuItems={[
 *     { id: 'docs', label: 'Documentation', icon: <BookIcon />, href: 'https://example.com/docs' },
 *     { id: 'support', label: 'Contact support', icon: <ChatIcon />, onClick: () => openSupportChat() },
 *   ]}
 *   menuItemOrder={['docs', 'support', 'settings', 'inviteMembers']}
 * />
 * ```
 */
export function Switcher(props: SwitcherProps = {}): ReactElement | null {
  const {
    showTriggerLabel,
    triggerBadge,
    mode = 'combined',
    triggerVariant: requestedTriggerVariant,
    customMenuItems,
    menuItemOrder,
    fallback,
    ...options
  } = props;
  const triggerVariant = mode === 'combined' ? (requestedTriggerVariant ?? 'full') : 'condensed';
  const profile = useMosaicProfile();
  const { userProfileProps, organizationProfileProps } = profile;
  // The portals must outlive the popover, so custom pages are bridged here rather than inside it.
  const userProfile = useCustomPages({
    items: userProfileProps?.customPages,
    order: userProfileProps?.pageOrder,
    builtInPages: useUserProfilePages(),
  });
  const organizationProfile = useCustomPages({
    items: organizationProfileProps?.customPages,
    order: organizationProfileProps?.pageOrder,
    builtInPages: useOrganizationProfilePages(),
  });
  const portals = (
    <>
      {userProfile.portals}
      {organizationProfile.portals}
    </>
  );
  const model = useSwitcherModel(options, {
    profile,
    bridgedCustomPages: {
      userProfile: userProfile.customPages,
      organizationProfile: organizationProfile.customPages,
    },
    menuMode: mode,
  });
  const controller = useSwitcherController(model, { mode, customMenuItems, menuItemOrder });

  if (controller.status === 'loading') {
    return (
      <>
        {fallback}
        {portals}
      </>
    );
  }

  // Signed out is an answer, so the placeholder goes too rather than promising a button.
  if (controller.status === 'hidden') {
    return <>{portals}</>;
  }

  const { status: _status, ...viewController } = controller;

  return (
    <>
      <SwitcherView
        {...viewController}
        showTriggerLabel={showTriggerLabel}
        triggerBadge={triggerBadge}
        triggerVariant={triggerVariant}
      />
      {portals}
    </>
  );
}
