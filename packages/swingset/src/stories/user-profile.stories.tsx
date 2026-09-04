import { Button } from '@clerk/ui/mosaic/components/button';
import { Dialog } from '@clerk/ui/mosaic/components/dialog';
import type { UserProfileViewProps } from '@clerk/ui/mosaic/user-profile/user-profile.view';
import { UserProfileView } from '@clerk/ui/mosaic/user-profile/user-profile.view';

import type { StoryMeta } from '@/lib/types';

import { useUserProfileFixture } from './fixtures/user-profile';

export { default as __source } from './user-profile.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfile',
  label: 'User profile',
  layout: 'wide',
  source: 'packages/ui/src/mosaic/user-profile/user-profile.view.tsx',
  // TEMPORARY, for design review: the compact navigation sheet's height.
  styles: {
    _variants: {
      navSheetHeight: { content: {}, 'two-thirds': {}, full: {} },
    },
    _defaultVariants: {
      navSheetHeight: 'content',
    },
  },
};

function knobsAsProps(props: Record<string, unknown>) {
  return props as unknown as Pick<UserProfileViewProps, 'navSheetHeight'>;
}

/**
 * The profile in a page. The fixture stands in for the model and controller: every page's data,
 * and actions that update it, so the surface behaves.
 */
export function Default(props: Record<string, unknown>) {
  const { activePage, setActivePage, pages } = useUserProfileFixture();
  return (
    <UserProfileView
      activePage={activePage}
      pages={pages}
      onPageChange={setActivePage}
      {...knobsAsProps(props)}
    />
  );
}

/**
 * The same profile as an overlay: opened from a trigger on the page into a `profile` dialog, which
 * positions it while the profile paints itself, names the dialog, and carries its dismiss.
 */
export function Overlay(props: Record<string, unknown>) {
  const { activePage, setActivePage, pages } = useUserProfileFixture();
  return (
    <Dialog.Root>
      <Dialog.Trigger render={<Button />}>Manage account</Dialog.Trigger>
      <Dialog.Popup size='profile'>
        <UserProfileView
          activePage={activePage}
          pages={pages}
          onPageChange={setActivePage}
          {...knobsAsProps(props)}
        />
      </Dialog.Popup>
    </Dialog.Root>
  );
}
