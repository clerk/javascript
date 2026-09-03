import { Button } from '@clerk/ui/mosaic/components/button';
import { Dialog } from '@clerk/ui/mosaic/components/dialog';
import { Drawer } from '@clerk/ui/mosaic/components/drawer';
import { Heading } from '@clerk/ui/mosaic/components/heading';
import { Icon } from '@clerk/ui/mosaic/components/icon';
import { Profile } from '@clerk/ui/mosaic/components/profile';
import { Text } from '@clerk/ui/mosaic/components/text';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './drawer.component.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Drawer',
  source: 'packages/ui/src/mosaic/components/drawer/drawer.tsx',
};

function SheetContent() {
  return (
    <>
      <Drawer.Title render={<Heading size='sm' />}>Sort members</Drawer.Title>
      <Drawer.Description render={<Text />}>Choose how the list is ordered.</Drawer.Description>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <Drawer.Close render={<Button variant='outline' />}>Name, A to Z</Drawer.Close>
        <Drawer.Close render={<Button variant='outline' />}>Joined, newest first</Drawer.Close>
        <Drawer.Close render={<Button variant='outline' />}>Role</Drawer.Close>
      </div>
    </>
  );
}

export function Default() {
  return (
    <Drawer.Root>
      <Drawer.Trigger render={<Button />}>Sort</Drawer.Trigger>
      <Drawer.Popup>
        <SheetContent />
      </Drawer.Popup>
    </Drawer.Root>
  );
}

/**
 * Opened from inside a `profile` dialog: the sheet rises over the profile and takes the nested
 * scrim, the way a prompt opened there does. Narrow the window below the phone band to see the
 * profile fill the screen first.
 */
export function InsideProfile() {
  const [page, setPage] = useState('members');
  return (
    <Dialog.Root>
      <Dialog.Trigger render={<Button />}>Manage organization</Dialog.Trigger>
      <Dialog.Popup size='profile'>
        <Profile.Root
          label='Organization'
          value={page}
          onValueChange={setPage}
        >
          <Profile.Nav>
            <Profile.NavItem
              value='general'
              icon={
                <Icon
                  name='user-circle'
                  size='sm'
                />
              }
            >
              General
            </Profile.NavItem>
            <Profile.NavItem
              value='members'
              icon={
                <Icon
                  name='users'
                  size='sm'
                />
              }
            >
              Members
            </Profile.NavItem>
          </Profile.Nav>
          <Profile.Content>
            <Profile.Page value='general'>
              <Profile.PageTitle>General</Profile.PageTitle>
            </Profile.Page>
            <Profile.Page value='members'>
              <div style={{ display: 'grid', gap: '1rem', justifyItems: 'start' }}>
                <Profile.PageTitle>Members</Profile.PageTitle>
                <Drawer.Root>
                  <Drawer.Trigger render={<Button variant='outline' />}>Sort</Drawer.Trigger>
                  <Drawer.Popup>
                    <SheetContent />
                  </Drawer.Popup>
                </Drawer.Root>
              </div>
            </Profile.Page>
          </Profile.Content>
        </Profile.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
