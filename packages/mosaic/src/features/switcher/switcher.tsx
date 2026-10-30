'use client';

import type { ReactElement, ReactNode } from 'react';

import { useMosaicProfile } from '../profile-pages/use-mosaic-profile';
import { useSwitcherController } from './switcher.controller';
import type { SwitcherModelOptions } from './switcher.model';
import { useSwitcherModel } from './switcher.model';
import { useCustomPages, useOrganizationProfilePages, useUserProfilePages } from './switcher.pages';
import type { SwitcherMenuProps, SwitcherMode } from './switcher.types';
import type { SwitcherTriggerProps, SwitcherTriggerVariant } from './switcher.view';
import { SwitcherView } from './switcher.view';

export type SwitcherProps = SwitcherModelOptions &
  SwitcherTriggerProps &
  SwitcherMenuProps & {
    /**
     * Fallback while loading.
     *
     * Note that the component renders nothing when the user is signed out, so using this on
     * pages that are reachable while both signed-out and signed-in can result in Fallback->Nothing.
     */
    fallback?: ReactNode;
  };

export function Switcher(
  props: SwitcherProps & { mode: SwitcherMode; triggerVariant?: SwitcherTriggerVariant },
): ReactElement | null {
  const { showTriggerLabel, triggerBadge, triggerVariant, mode, customMenuItems, menuItemOrder, fallback, ...options } =
    props;
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
