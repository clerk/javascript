'use client';

import { Button } from '@clerk/mosaic/components/button';
import { SignUp } from '@clerk/mosaic/features/sign-up';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useAuth, useClerk, useSignUp } from '@clerk/nextjs';
import { useState } from 'react';

import { LivePageHeader } from '../../../live-page-header';

export default function SignUpLivePage() {
  const clerk = useClerk();
  const { isSignedIn } = useAuth();
  const { signUp } = useSignUp();
  const [demoKey, setDemoKey] = useState(0);

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <div className='flex flex-col gap-4'>
          <LivePageHeader title='Sign up'>
            The connected sign-up flow with virtual routing. Signing up creates a real user in the application, so sign
            out first.
          </LivePageHeader>
          <div className='flex flex-wrap items-center justify-end gap-4'>
            {isSignedIn ? (
              <Button
                variant='outline'
                onClick={() => void clerk.signOut()}
              >
                Sign out
              </Button>
            ) : null}
            <Button
              variant='outline'
              onClick={() =>
                // A remount alone resumes the sign-up in progress, so clear it first.
                void signUp.reset().then(({ error }) => {
                  if (!error) {
                    setDemoKey(key => key + 1);
                  }
                })
              }
            >
              Reset
            </Button>
          </div>
        </div>
        <div className='flex justify-center'>
          {isSignedIn ? (
            <p className='text-sm'>You&apos;re signed in. Sign out to try the sign-up flow.</p>
          ) : (
            <SignUp key={demoKey} />
          )}
        </div>
      </div>
    </MosaicProvider>
  );
}
