'use client';

import { Button } from '@clerk/mosaic/components/button';
import { SignOutButton } from '@clerk/mosaic/features/sign-out-button/sign-out-button';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

import { LivePageHeader } from '../../../live-page-header';

export default function SignOutButtonLivePage() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <LivePageHeader title='Sign out button'>
          Signs the user out for real and returns here. The button renders only while someone is signed in.
        </LivePageHeader>
        {isLoaded && !isSignedIn ? (
          <p className='text-muted-foreground text-sm'>
            <Link
              href='/sign-in'
              className='text-foreground underline underline-offset-4'
            >
              Sign in
            </Link>{' '}
            to sign out again.
          </p>
        ) : null}
        <div>
          <SignOutButton
            redirectUrl='/live/misc/sign-out-button'
            render={<Button />}
          />
        </div>
      </div>
    </MosaicProvider>
  );
}
