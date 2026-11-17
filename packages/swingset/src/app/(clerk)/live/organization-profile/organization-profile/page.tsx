'use client';

import { OrganizationProfile } from '@clerk/mosaic/features/organization-profile/organization-profile';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useOrganization, useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function OrganizationProfileLivePage() {
  const { isLoaded, isSignedIn } = useUser();
  const { organization } = useOrganization();

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-5xl flex-col gap-6 p-3 sm:p-8'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-xl font-semibold'>Organization profile</h1>
          <p className='text-muted-foreground text-sm'>
            The connected organization profile, with the general, members, and API keys pages for the active
            organization.
          </p>
        </div>
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
          <p className='text-muted-foreground text-sm'>Pick an active organization to see its profile.</p>
        ) : null}
        <OrganizationProfile fallback={<p className='text-muted-foreground text-sm'>Loading…</p>} />
      </div>
    </MosaicProvider>
  );
}
