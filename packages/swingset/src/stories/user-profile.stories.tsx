import { Button } from '@clerk/mosaic/components/button';
import { Dialog } from '@clerk/mosaic/components/dialog';
import { UserProfileView } from '@clerk/mosaic/features/user-profile/user-profile.view';

import type { StoryMeta } from '@/lib/types';

import { useUserProfileFixture } from './fixtures/user-profile';

export { default as __source } from './user-profile.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  title: 'UserProfile',
  label: 'User profile',
  layout: 'wide',
  source: 'packages/mosaic/src/features/user-profile/user-profile.view.tsx',
  styles: {
    _variants: {
      showSearch: { true: {}, false: {} },
    },
    _defaultVariants: {
      showSearch: 'false',
    },
  },
};

function knobsAsProps(props: Record<string, unknown>) {
  return { showSearch: props.showSearch === true || props.showSearch === 'true' };
}

/**
 * The profile as a page's content — `elevation='flush'`, the way a `Card` chooses its elevation:
 * unframed, flush with its host, scrolling with the page. The fixture stands in for the model and
 * controller: every page's data, and actions that update it, so the surface behaves.
 */
export function Default(props: Record<string, unknown>) {
  const { activePage, setActivePage, pages } = useUserProfileFixture();
  return (
    <UserProfileView
      activePage={activePage}
      pages={pages}
      onPageChange={setActivePage}
      elevation='flush'
      {...knobsAsProps(props)}
    />
  );
}

/**
 * The same profile as an overlay: opened from a trigger on the page into a `profile` dialog, which
 * positions it while the profile paints itself, names the dialog, and carries its dismiss.
 */
export function Overlay() {
  const { activePage, setActivePage, pages } = useUserProfileFixture();
  return (
    <Dialog.Root>
      <Dialog.Trigger render={<Button />}>Manage account</Dialog.Trigger>
      <Dialog.Popup variant='profile'>
        <UserProfileView
          activePage={activePage}
          pages={pages}
          onPageChange={setActivePage}
        />
      </Dialog.Popup>
    </Dialog.Root>
  );
}

export function Fullscreen() {
  const { activePage, setActivePage, pages } = useUserProfileFixture();
  return (
    <Dialog.Root>
      <Dialog.Trigger render={<Button />}>Manage account</Dialog.Trigger>
      <Dialog.Popup variant='fullscreen'>
        <UserProfileView
          activePage={activePage}
          pages={pages}
          onPageChange={setActivePage}
        />
      </Dialog.Popup>
    </Dialog.Root>
  );
}
