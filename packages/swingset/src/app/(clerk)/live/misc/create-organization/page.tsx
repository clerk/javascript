'use client';

import { CreateOrganization } from '@clerk/mosaic/features/create-organization/create-organization';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

import { LivePageHeader } from '../../../live-page-header';

export default function CreateOrganizationLivePage() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <LivePageHeader title='Create organization'>
          Creates a real organization for the signed-in user, makes it active, and invites members to it. Organizations
          must be enabled for the application.
        </LivePageHeader>
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
        <CreateOrganization fallback={<p className='text-muted-foreground text-sm'>Loading…</p>} />
      </div>
    </MosaicProvider>
  );
}
