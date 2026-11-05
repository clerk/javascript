'use client';

import { OrganizationProfileView } from '@clerk/mosaic/features/organization-profile/organization-profile.view';
import { UserProfileView } from '@clerk/mosaic/features/user-profile/user-profile.view';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useOrganizationProfileFixture } from '@swingset/stories/fixtures/organization-profile';
import { useUserProfileFixture } from '@swingset/stories/fixtures/user-profile';

function UserProfileDemo() {
  const { activePage, setActivePage, pages } = useUserProfileFixture();
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

export function ProfileShowcase() {
  return (
    <MosaicProvider>
      <section className='mx-auto max-w-6xl px-6 py-16 md:px-14'>
        <h2 className='mb-6 text-2xl font-medium'>User profile</h2>
        <div className='border-foreground/10 overflow-hidden rounded-2xl border bg-[var(--cl-color-page)]'>
          <UserProfileDemo />
        </div>
      </section>
      <section className='mx-auto max-w-6xl px-6 py-16 md:px-14'>
        <h2 className='mb-6 text-2xl font-medium'>Organization profile</h2>
        <div className='border-foreground/10 overflow-hidden rounded-2xl border bg-[var(--cl-color-page)]'>
          <OrganizationProfileDemo />
        </div>
      </section>
    </MosaicProvider>
  );
}
