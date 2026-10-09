'use client';

import { OrganizationProfileApiKeysPanel } from '@clerk/mosaic/features/organization-profile/organization-profile-api-keys-panel';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useOrganization, useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function OrganizationApiKeysLivePage() {
  const { isLoaded, isSignedIn } = useUser();
  const { organization } = useOrganization();

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-xl font-semibold'>Organization API keys</h1>
          <p className='text-muted-foreground text-sm'>
            The organization profile API keys panel, listing, creating, and revoking real API keys for the active
            organization. API keys must be enabled for the application.
          </p>
        </div>
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
          <p className='text-muted-foreground text-sm'>Pick an active organization to see its API keys panel.</p>
        ) : null}
        {isLoaded && isSignedIn ? <OrganizationProfileApiKeysPanel /> : null}
      </div>
    </MosaicProvider>
  );
}
