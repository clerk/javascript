'use client';

import { Button } from '@clerk/mosaic/components/button';
import { InviteMembersButton } from '@clerk/mosaic/features/invite-members-button/invite-members-button';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useOrganization, useUser } from '@clerk/nextjs';
import Link from 'next/link';

import { LivePageHeader } from '../../../live-page-header';

export default function InviteMembersButtonLivePage() {
  const { isLoaded, isSignedIn } = useUser();
  const { organization } = useOrganization();

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <LivePageHeader title='Invite members button'>
          Invite members to the active organization. The button renders only for members who can manage memberships.
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
          <p className='text-muted-foreground text-sm'>Pick an active organization to invite members to it.</p>
        ) : null}
        {isLoaded && isSignedIn ? (
          <div>
            <InviteMembersButton render={<Button />} />
          </div>
        ) : null}
      </div>
    </MosaicProvider>
  );
}
