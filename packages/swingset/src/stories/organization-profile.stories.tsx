import { Button } from '@clerk/mosaic/components/button';
import { Dialog } from '@clerk/mosaic/components/dialog';
import { OrganizationProfileView } from '@clerk/mosaic/features/organization-profile/organization-profile.view';

import type { StoryMeta } from '@/lib/types';

import { useOrganizationProfileFixture } from './fixtures/organization-profile';

export { default as __source } from './organization-profile.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  status: 'wip',
  substatus: 'needs wire-up',
  title: 'OrganizationProfile',
  label: 'Organization profile',
  layout: 'wide',
  source: 'packages/mosaic/src/features/organization-profile/organization-profile.view.tsx',
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

export function Default(props: Record<string, unknown>) {
  const { activePage, setActivePage, pages } = useOrganizationProfileFixture();
  return (
    <OrganizationProfileView
      activePage={activePage}
      pages={pages}
      onPageChange={setActivePage}
      elevation='flush'
      {...knobsAsProps(props)}
    />
  );
}

function OverlayProfile() {
  const { activePage, setActivePage, pages } = useOrganizationProfileFixture();
  return (
    <OrganizationProfileView
      activePage={activePage}
      pages={pages}
      onPageChange={setActivePage}
    />
  );
}

export function Overlay() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={<Button />}>Manage organization</Dialog.Trigger>
      <Dialog.Popup variant='profile'>
        <OverlayProfile />
      </Dialog.Popup>
    </Dialog.Root>
  );
}

export function Fullscreen() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={<Button />}>Manage organization</Dialog.Trigger>
      <Dialog.Popup variant='fullscreen'>
        <OverlayProfile />
      </Dialog.Popup>
    </Dialog.Root>
  );
}
