'use client';

import { OrganizationProfileDangerSection } from '@clerk/mosaic/features/organization-profile/organization-profile-danger-section/organization-profile-danger-section';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useOrganization, useUser } from '@clerk/nextjs';
import Link from 'next/link';

import { LivePageHeader } from '../../live-page-header';

export default function OrganizationDangerLivePage() {
  const { isLoaded, isSignedIn } = useUser();
  const { organization } = useOrganization();

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <LivePageHeader title='Organization danger zone'>
          Leaves or deletes the active organization. Deleting needs the delete permission and admin delete turned on for
          the instance.
        </LivePageHeader>
        {!isLoaded ? <p className='text-muted-foreground text-sm'>Loading…</p> : null}
        {isLoaded && !isSignedIn ? (
          <p className='text-muted-foreground text-sm'>
            <Link
              href='/sign-in'
              className='text-foreground underline underline-offset-4'
            >
              Sign in
            </Link>{' '}
            and pick an active organization.
          </p>
        ) : null}
        {isLoaded && isSignedIn && !organization ? (
          <p className='text-muted-foreground text-sm'>Pick an active organization to see its danger zone.</p>
        ) : null}
        {isLoaded && isSignedIn ? <OrganizationProfileDangerSection afterLeaveOrganizationUrl='/live' /> : null}
      </div>
    </MosaicProvider>
  );
}
