'use client';

import { APIKeysTable } from '@clerk/mosaic/features/api-keys/api-keys-table';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useOrganization, useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function APIKeysTableLivePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { organization } = useOrganization();

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-xl font-semibold'>API keys table</h1>
          <p className='text-muted-foreground text-sm'>
            The API keys table for the signed-in user and their active organization, listing, creating, and revoking
            real API keys. API keys must be enabled for the application.
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
            to use the live harness.
          </p>
        ) : null}
        {user ? <APIKeysTable subject={user.id} /> : null}
        {organization ? <APIKeysTable subject={organization.id} /> : null}
      </div>
    </MosaicProvider>
  );
}
