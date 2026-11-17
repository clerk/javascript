'use client';

import { Button } from '@clerk/mosaic/components/button';
import { SignInButton } from '@clerk/mosaic/features/sign-in-button/sign-in-button';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';

import { LivePageHeader } from '../../../live-page-header';

export default function SignInButtonLivePage() {
  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <LivePageHeader title='Sign in button'>
          Starts a real sign-in, on the sign-in page or in a modal, and returns here after. Sign out first to see the
          full flow.
        </LivePageHeader>
        <div className='flex flex-wrap gap-3'>
          <SignInButton
            fallbackRedirectUrl='/live/misc/sign-in-button'
            render={<Button />}
          >
            Sign in on the page
          </SignInButton>
          <SignInButton
            mode='modal'
            fallbackRedirectUrl='/live/misc/sign-in-button'
            render={<Button variant='outline' />}
          >
            Sign in in a modal
          </SignInButton>
        </div>
      </div>
    </MosaicProvider>
  );
}
