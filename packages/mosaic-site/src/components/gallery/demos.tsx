'use client';
import { OrganizationProfileView } from '@clerk/mosaic/features/organization-profile/organization-profile.view';
import { SwitcherView } from '@clerk/mosaic/features/switcher/switcher.view';
import { UserProfileView } from '@clerk/mosaic/features/user-profile/user-profile.view';
import { useOrganizationProfileFixture } from '@swingset/stories/fixtures/organization-profile';
import { usePrototype } from '@swingset/stories/fixtures/switcher';
import { useUserProfileFixture } from '@swingset/stories/fixtures/user-profile';
import type * as React from 'react';

import { CanvasSettings } from '@/components/gallery/canvas-settings';
import {
  CreateOrganizationDemo,
  OrganizationListDemo,
  OrganizationSwitcherDemo,
  WaitlistDemo,
} from '@/components/gallery/feature-demos';
import { useRemixValue } from '@/components/gallery/remix';
import { TabsProfile } from '@/components/gallery/tabs-profile';
import { withoutOrganizationComingSoon, withoutUserComingSoon } from '@/lib/components/pages';

function UserButtonDemo() {
  const prototype = usePrototype();
  return (
    <SwitcherView
      {...prototype}
      mode='combined'
      triggerVariant='full'
    />
  );
}
function UserProfileDemo() {
  const { activePage, setActivePage, pages } = useUserProfileFixture();
  const remix = useRemixValue();
  if (remix === 'canvas') {
    return <CanvasSettings />;
  }
  if (remix === 'tabs') {
    return <TabsProfile />;
  }
  return (
    <UserProfileView
      activePage={activePage}
      pages={withoutUserComingSoon(pages)}
      onPageChange={setActivePage}
      elevation='flush'
    />
  );
}
function CombinedProfileDemo() {
  const { activePage, setActivePage, pages } = useUserProfileFixture();
  const organization = useOrganizationProfileFixture();
  return (
    <UserProfileView
      activePage={activePage}
      pages={withoutUserComingSoon(pages)}
      organization={{ pages: withoutOrganizationComingSoon(organization.pages) }}
      onPageChange={setActivePage}
      elevation='flush'
    />
  );
}
function OrganizationProfileDemo() {
  const { activePage, setActivePage, pages } = useOrganizationProfileFixture();
  return (
    <OrganizationProfileView
      activePage={activePage}
      pages={withoutOrganizationComingSoon(pages)}
      onPageChange={setActivePage}
      elevation='flush'
    />
  );
}
export const DEMOS: Record<string, () => React.ReactElement> = {
  'user-button': UserButtonDemo,
  'user-profile': UserProfileDemo,
  'combined-profile': CombinedProfileDemo,
  'organization-profile': OrganizationProfileDemo,
  'organization-switcher': OrganizationSwitcherDemo,
  'organization-list': OrganizationListDemo,
  'create-organization': CreateOrganizationDemo,
  waitlist: WaitlistDemo,
};
