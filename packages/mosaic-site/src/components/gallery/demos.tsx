'use client';
import { Avatar } from '@clerk/mosaic/components/avatar';
import { Badge } from '@clerk/mosaic/components/badge';
import { Banner } from '@clerk/mosaic/components/banner';
import { Button } from '@clerk/mosaic/components/button';
import { Switch } from '@clerk/mosaic/components/switch';
import { APIKeysTableView } from '@clerk/mosaic/features/api-keys/api-keys-table.view';
import { OrganizationProfileView } from '@clerk/mosaic/features/organization-profile/organization-profile.view';
import { SwitcherView } from '@clerk/mosaic/features/switcher/switcher.view';
import { UserProfileView } from '@clerk/mosaic/features/user-profile/user-profile.view';
import { useAPIKeysTableFixture } from '@swingset/stories/fixtures/api-keys-table';
import { useOrganizationProfileFixture } from '@swingset/stories/fixtures/organization-profile';
import { usePrototype } from '@swingset/stories/fixtures/switcher';
import { useUserProfileFixture } from '@swingset/stories/fixtures/user-profile';
import type * as React from 'react';

import { CanvasSettings } from '@/components/gallery/canvas-settings';
import { useRemixValue } from '@/components/gallery/remix';

function ButtonDemo() {
  return (
    <div className='flex flex-col items-center gap-3'>
      <div className='flex items-center gap-3'>
        <Button>Primary</Button>
        <Button
          color='neutral'
          variant='outline'
        >
          Outline
        </Button>
        <Button
          color='neutral'
          variant='ghost'
        >
          Ghost
        </Button>
      </div>
      <div className='flex items-center gap-3'>
        <Button size='sm'>Small</Button>
        <Button color='negative'>Delete</Button>
        <Button variant='link'>Link</Button>
      </div>
    </div>
  );
}
function BadgeDemo() {
  return (
    <div className='flex flex-wrap items-center justify-center gap-3'>
      <Badge color='primary'>Primary</Badge>
      <Badge color='neutral'>Neutral</Badge>
      <Badge color='warning'>Warning</Badge>
      <Badge color='negative'>Negative</Badge>
      <Badge color='positive'>Positive</Badge>
    </div>
  );
}
function BannerDemo() {
  return (
    <div className='flex w-full max-w-[460px] flex-col gap-3'>
      <Banner.Root color='positive'>
        <Banner.Label>Positive banner</Banner.Label>
        <Banner.Description>This is the description for a positive banner</Banner.Description>
      </Banner.Root>
      <Banner.Root color='warning'>
        <Banner.Label>Warning banner</Banner.Label>
        <Banner.Description>Your payment could not be processed. Please try again.</Banner.Description>
      </Banner.Root>
    </div>
  );
}
function AvatarDemo() {
  return (
    <div className='flex items-center gap-4'>
      <Avatar.Root>
        <Avatar.Fallback>CL</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root>
        <Avatar.Fallback>PB</Avatar.Fallback>
      </Avatar.Root>
    </div>
  );
}
function SwitchDemo() {
  return (
    <div className='flex items-center gap-4'>
      <Switch aria-label='Off' />
      <Switch
        aria-label='On'
        defaultChecked
      />
      <Switch
        aria-label='Disabled'
        disabled
      />
    </div>
  );
}
function UserButtonDemo() {
  const prototype = usePrototype({ hidePersonal: true });
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
  return (
    <UserProfileView
      activePage={activePage}
      pages={pages}
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
      pages={pages}
      onPageChange={setActivePage}
      elevation='flush'
    />
  );
}
function APIKeysTableDemo() {
  const props = useAPIKeysTableFixture();
  return <APIKeysTableView {...props} />;
}
export const DEMOS: Record<string, () => React.ReactElement> = {
  button: ButtonDemo,
  badge: BadgeDemo,
  banner: BannerDemo,
  avatar: AvatarDemo,
  switch: SwitchDemo,
  'user-button': UserButtonDemo,
  'user-profile': UserProfileDemo,
  'organization-profile': OrganizationProfileDemo,
  'api-keys-table': APIKeysTableDemo,
};
