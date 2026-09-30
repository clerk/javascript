'use client';

import { Destructive } from '@clerk/mosaic/blocks/destructive';
import { useDestructiveController } from '@clerk/mosaic/blocks/destructive/destructive.controller';
import { Button } from '@clerk/mosaic/components/button';
import { Reverification, useReverificationActors } from '@clerk/mosaic/features/reverification';
import { MosaicProvider } from '@clerk/mosaic/MosaicProvider';
import { useUser } from '@clerk/nextjs';
import { ClerkAPIResponseError } from '@clerk/shared/error';
import Link from 'next/link';
import { useState } from 'react';

const SUCCESS_DELAY_MS = 3000;

async function mockDelete(delaySuccess: boolean) {
  const response = await fetch('/api/live/mock-delete', { method: 'POST' });
  const body = await response.json().catch(() => ({}));

  if (body?.clerk_error?.reason === 'reverification-error') {
    throw new ClerkAPIResponseError('Reverification required', {
      data: [{ code: 'session_reverification_required', message: 'Reverification required', long_message: '' }],
      status: 403,
    });
  }
  if (!response.ok) {
    throw new Error(typeof body.error === 'string' ? body.error : `Mock delete failed (${response.status})`);
  }
  if (delaySuccess) {
    await new Promise(resolve => {
      setTimeout(resolve, SUCCESS_DELAY_MS);
    });
  }
  return body;
}

async function resetMockDelete() {
  await fetch('/api/live/mock-delete', { method: 'DELETE' });
}

function DestructiveHarness() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const destructive = useDestructiveController({
    onDelete: async () => {
      setSuccessMessage(null);
      await mockDelete(true);
      setSuccessMessage('Mock delete completed. The account was not deleted.');
    },
    reverification: useReverificationActors(),
  });

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <Button
          color='negative'
          onClick={() => {
            setSuccessMessage(null);
            void resetMockDelete();
            destructive.openDestructiveDialog();
          }}
          disabled={destructive.open}
        >
          Delete account
        </Button>
      </div>
      {successMessage ? <p className='text-sm'>{successMessage}</p> : null}
      <Destructive
        {...destructive}
        title='Delete account?'
        description='This mock asks for verification, then waits before a fake success. The account is not deleted.'
        fieldLabel='Type “Delete account” below to continue'
        confirmationValue='Delete account'
        actionLabel='Delete account'
        verificationSlot={<Reverification actor={destructive.verification} />}
      />
    </div>
  );
}

export default function ReverificationLivePage() {
  const { isLoaded, isSignedIn } = useUser();
  const [demoKey, setDemoKey] = useState(0);

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-10 p-3 sm:p-8'>
        <div className='flex flex-col gap-4'>
          <h1 className='text-xl font-semibold'>Reverification</h1>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <p className='text-muted-foreground max-w-xl text-sm'>
              Delete account hits a mock route that asks for reverification, then a fake success. The account is not
              deleted. Reset clears the mock state.
            </p>
            <Button
              variant='outline'
              onClick={() => {
                void resetMockDelete();
                setDemoKey(key => key + 1);
              }}
            >
              Reset
            </Button>
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
        </div>
        <section className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1'>
            <h2 className='text-base font-semibold'>Destructive</h2>
            <p className='text-muted-foreground text-sm'>
              Destructive keeps its dialog and card while Reverification replaces the confirmation step.
            </p>
          </div>
          {isLoaded && isSignedIn ? <DestructiveHarness key={demoKey} /> : null}
        </section>
      </div>
    </MosaicProvider>
  );
}
