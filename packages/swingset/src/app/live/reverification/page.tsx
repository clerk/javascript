'use client';

import { SignIn, SignOutButton, useUser } from '@clerk/nextjs';
import { isReverificationCancelledError } from '@clerk/shared/error';
import { Button } from '@clerk/ui/mosaic/components/button';
import { Reverification, useReverificationWithState } from '@clerk/ui/mosaic/features/reverification';
import { MosaicProvider } from '@clerk/ui/mosaic/MosaicProvider';
import { useState } from 'react';

async function mockDelete() {
  const response = await fetch('/api/live/mock-delete', { method: 'POST' });
  const body = await response.json().catch(() => ({}));

  if (body?.clerk_error?.reason === 'reverification-error') {
    return body;
  }
  if (!response.ok) {
    throw new Error(typeof body.error === 'string' ? body.error : `Mock delete failed (${response.status})`);
  }
  return body;
}

async function resetMockDelete() {
  await fetch('/api/live/mock-delete', { method: 'DELETE' });
}

function DeleteAccountHarness() {
  const { user } = useUser();
  const [status, setStatus] = useState<'idle' | 'success' | 'cancelled' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [deleteAccount, reverification] = useReverificationWithState(mockDelete);

  if (!user) {
    return null;
  }

  return (
    <div className='flex flex-col gap-4'>
      <p className='text-muted-foreground text-sm'>Signed in as {user.primaryEmailAddress?.emailAddress ?? user.id}</p>
      <div className='flex flex-wrap items-center gap-2'>
        <Button
          color='negative'
          onClick={() => {
            void (async () => {
              try {
                setStatus('idle');
                setMessage(null);
                const result = await deleteAccount();
                console.info('[swingset] mock delete succeeded', result);
                setStatus('success');
                setMessage('Mock delete completed. The account was not deleted.');
              } catch (error) {
                await resetMockDelete();
                if (isReverificationCancelledError(error)) {
                  setStatus('cancelled');
                  setMessage('Reverification cancelled.');
                  return;
                }
                setStatus('error');
                setMessage(error instanceof Error ? error.message : 'Mock delete failed.');
              }
            })();
          }}
        >
          Delete account
        </Button>
        <SignOutButton redirectUrl='/live/reverification'>
          <Button variant='outline'>Sign out</Button>
        </SignOutButton>
      </div>
      <Reverification {...reverification} />
      {message ? <p className={status === 'error' ? 'text-sm text-red-600' : 'text-sm'}>{message}</p> : null}
    </div>
  );
}

// Throwaway live harness. Not a story.
export default function ReverificationLivePage() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-xl font-semibold'>Reverification</h1>
          <p className='text-muted-foreground text-sm'>
            Throwaway live page. Delete account hits a mock route that returns a reverification hint, then a fake
            success. The account is not deleted.
          </p>
        </div>
        {!isLoaded ? <p className='text-muted-foreground text-sm'>Loading…</p> : null}
        {isLoaded && !isSignedIn ? <SignIn /> : null}
        {isLoaded && isSignedIn ? <DeleteAccountHarness /> : null}
      </div>
    </MosaicProvider>
  );
}
