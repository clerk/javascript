'use client';
import { Button } from '@clerk/mosaic/components/button';
import { Dialog } from '@clerk/mosaic/components/dialog';
import { OrganizationProfileView } from '@clerk/mosaic/features/organization-profile/organization-profile.view';
import { UserProfileView } from '@clerk/mosaic/features/user-profile/user-profile.view';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useOrganizationProfileFixture } from '@swingset/stories/fixtures/organization-profile';
import { useUserProfileFixture } from '@swingset/stories/fixtures/user-profile';
import * as React from 'react';

import { Header, MobileShell, PageSkeleton, Rail, Skeleton } from '@/components/gallery/app-wireframe';
import { RemixReceiver } from '@/components/gallery/remix';
import { EmbedScrollBridge } from '@/components/gallery/scroll-bridge';
import { ThemeReceiver } from '@/components/gallery/theme';
import { TouchMode, useTouchParam } from '@/components/gallery/touch-mode';
import { frameUrlFor } from '@/lib/components/frame';
import { withoutOrganizationComingSoon, withoutUserComingSoon } from '@/lib/components/pages';
export function UserProfileModal() {
  const { activePage, setActivePage, pages } = useUserProfileFixture();
  return (
    <UserProfileView
      activePage={activePage}
      pages={withoutUserComingSoon(pages)}
      onPageChange={setActivePage}
    />
  );
}
export function CombinedProfileModal() {
  const { activePage, setActivePage, pages } = useUserProfileFixture();
  const organization = useOrganizationProfileFixture();
  return (
    <UserProfileView
      activePage={activePage}
      pages={withoutUserComingSoon(pages)}
      organization={{ pages: withoutOrganizationComingSoon(organization.pages) }}
      onPageChange={setActivePage}
    />
  );
}
export function OrganizationProfileModal() {
  const { activePage, setActivePage, pages } = useOrganizationProfileFixture();
  return (
    <OrganizationProfileView
      activePage={activePage}
      pages={withoutOrganizationComingSoon(pages)}
      onPageChange={setActivePage}
    />
  );
}
const TRIGGER_LABELS: Record<string, string> = {
  'user-profile': 'Manage account',
  'combined-profile': 'Manage account',
  'organization-profile': 'Manage organization',
};
const MODALS: Record<string, () => React.ReactElement> = {
  'user-profile': UserProfileModal,
  'combined-profile': CombinedProfileModal,
  'organization-profile': OrganizationProfileModal,
};
export function EmbedModal({ slug }: { slug: string }) {
  const Modal = MODALS[slug];
  const [open, setOpen] = React.useState(true);
  const touch = useTouchParam();
  return (
    <MosaicProvider>
      <EmbedScrollBridge />
      <RemixReceiver />
      <ThemeReceiver />
      <TouchMode />
      {touch ? (
        <MobileShell url={frameUrlFor(slug)}>
          <div className='flex flex-col gap-4'>
            <Button onClick={() => setOpen(true)}>{TRIGGER_LABELS[slug]}</Button>
            <Skeleton className='h-24 rounded-xl' />
            <Skeleton className='h-24 rounded-xl' />
            <Skeleton className='h-3 w-3/4' />
            <Skeleton className='h-3 w-1/2' />
          </div>
        </MobileShell>
      ) : (
        <div className='flex min-h-svh bg-[var(--cl-color-page,#fff)]'>
          <Rail />
          <div className='flex min-w-0 flex-1 flex-col'>
            <Header action={<Button onClick={() => setOpen(true)}>{TRIGGER_LABELS[slug]}</Button>} />
            <PageSkeleton />
          </div>
        </div>
      )}
      <Dialog.Root
        open={open}
        onOpenChange={setOpen}
      >
        <Dialog.Popup
          variant='profile'
          initialFocus={false}
        >
          <Modal />
        </Dialog.Popup>
      </Dialog.Root>
    </MosaicProvider>
  );
}
