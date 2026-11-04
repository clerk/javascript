import { Button } from '@clerk/mosaic/components/button';
import { Dialog } from '@clerk/mosaic/components/dialog';
import { OrganizationProfileView } from '@clerk/mosaic/features/organization-profile/organization-profile.view';

import type { StoryMeta } from '@/lib/types';

import { useOrganizationProfileFixture } from './fixtures/organization-profile';
import { useOrganizationProfileAccessFixture } from './fixtures/organization-profile-access';

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
  const { activePage, setActivePage, pages, contentLayout } = useOrganizationProfileFixture();
  return (
    <OrganizationProfileView
      {...contentLayout}
      activePage={activePage}
      pages={pages}
      onPageChange={setActivePage}
    />
  );
}

function OverlayProfile() {
  const { activePage, setActivePage, pages, contentLayout } = useOrganizationProfileFixture();
  return (
    <OrganizationProfileView
      {...contentLayout}
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

export function Access() {
  const access = useOrganizationProfileAccessFixture();
  return (
    <OrganizationProfileView
      activePage='access'
      onPageChange={() => undefined}
      pages={{ general: null, access: access.page }}
      {...access.layout}
    />
  );
}

export function EmptyAccess() {
  const access = useOrganizationProfileAccessFixture({ empty: true });
  return (
    <OrganizationProfileView
      activePage='access'
      onPageChange={() => undefined}
      pages={{ general: null, access: access.page }}
      {...access.layout}
    />
  );
}

export function AccessErrors() {
  const access = useOrganizationProfileAccessFixture({ failSave: true, failTest: true, failVerification: true });
  return (
    <OrganizationProfileView
      activePage='access'
      onPageChange={() => undefined}
      pages={{ general: null, access: access.page }}
      {...access.layout}
    />
  );
}
