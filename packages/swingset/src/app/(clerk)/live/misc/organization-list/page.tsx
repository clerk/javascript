'use client';

import { OrganizationList } from '@clerk/mosaic/features/organization-list/organization-list';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

import { LivePageHeader } from '../../../live-page-header';

export default function OrganizationListLivePage() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <LivePageHeader title='Organization list'>
          Lists the real organizations, invitations, and suggestions of the signed-in user, and makes the one selected
          active. Organizations must be enabled for the application.
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
        <OrganizationList fallback={<p className='text-muted-foreground text-sm'>Loading…</p>} />
      </div>
    </MosaicProvider>
  );
}
