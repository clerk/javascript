import { Button } from '@clerk/ui/mosaic/components/button';
import { Dialog } from '@clerk/ui/mosaic/components/dialog';
import { Drawer } from '@clerk/ui/mosaic/components/drawer';
import { Heading } from '@clerk/ui/mosaic/components/heading';
import { Text } from '@clerk/ui/mosaic/components/text';
import { UserProfileView } from '@clerk/ui/mosaic/user-profile/user-profile.view';

import type { StoryMeta } from '@/lib/types';

import { useUserProfileFixture } from './fixtures/user-profile';

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
 * The user profile in a `profile` dialog. Narrow the window below the phone band: the profile fills
 * the screen, and its navigation moves into a sheet that each page's headline opens.
 */
export function InsideProfile() {
  const { activePage, setActivePage, pages } = useUserProfileFixture();
  return (
    <Dialog.Root>
      <Dialog.Trigger render={<Button />}>Manage account</Dialog.Trigger>
      <Dialog.Popup size='profile'>
        <UserProfileView
          activePage={activePage}
          pages={pages}
          onPageChange={setActivePage}
        />
      </Dialog.Popup>
    </Dialog.Root>
  );
}
