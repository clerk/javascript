'use client';

import { Button } from '@clerk/mosaic/components/button';
import { SignUpButton } from '@clerk/mosaic/features/sign-up-button/sign-up-button';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';

import { LivePageHeader } from '../../../live-page-header';

export default function SignUpButtonLivePage() {
  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <LivePageHeader title='Sign up button'>
          Starts a real sign-up, on the sign-up page or in a modal, and returns here after. Sign out first to see the
          full flow.
        </LivePageHeader>
        <div className='flex flex-wrap gap-3'>
          <SignUpButton
            fallbackRedirectUrl='/live/misc/sign-up-button'
            render={<Button />}
          >
            Sign up on the page
          </SignUpButton>
          <SignUpButton
            mode='modal'
            fallbackRedirectUrl='/live/misc/sign-up-button'
            render={<Button variant='outline' />}
          >
            Sign up in a modal
          </SignUpButton>
        </div>
      </div>
    </MosaicProvider>
  );
}
