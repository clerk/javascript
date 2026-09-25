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
};

export function Default() {
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

export function Overlay() {
  const { activePage, setActivePage, pages } = useOrganizationProfileFixture();
  return (
    <Dialog.Root>
      <Dialog.Trigger render={<Button />}>Manage workspace</Dialog.Trigger>
      <Dialog.Popup variant='profile'>
        <OrganizationProfileView
          activePage={activePage}
          pages={pages}
          onPageChange={setActivePage}
        />
      </Dialog.Popup>
    </Dialog.Root>
  );
}
