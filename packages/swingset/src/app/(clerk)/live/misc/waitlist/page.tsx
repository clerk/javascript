'use client';

import { Button } from '@clerk/mosaic/components/button';
import { Waitlist } from '@clerk/mosaic/features/waitlist/waitlist';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useClerk } from '@clerk/nextjs';
import type { EnvironmentResource } from '@clerk/shared/types';
import { useState } from 'react';

import { LivePageHeader } from '../../../live-page-header';

export default function WaitlistLivePage() {
  const clerk = useClerk();
  const [redirect, setRedirect] = useState(false);
  const [demoKey, setDemoKey] = useState(0);
  const environment = (clerk as unknown as { __internal_environment?: EnvironmentResource | null })
    .__internal_environment;
  const signUpMode = environment?.userSettings.signUp.mode;

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <div className='flex flex-col gap-4'>
          <LivePageHeader title='Waitlist'>
            The connected waitlist. Joining adds a real entry to the application&apos;s waitlist, so the application
            needs its sign-up mode set to Waitlist.
          </LivePageHeader>
          {clerk.loaded && signUpMode !== 'waitlist' ? (
            <p className='rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm'>
              This application&apos;s sign-up mode is <code className='font-mono text-xs'>{signUpMode}</code>, not{' '}
              <code className='font-mono text-xs'>waitlist</code>. The form renders, but joining will fail until
              waitlist mode is turned on in the Clerk Dashboard.
            </p>
          ) : null}
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <label className='flex items-center gap-2 text-sm'>
              <input
                type='checkbox'
                checked={redirect}
                onChange={event => {
                  setRedirect(event.target.checked);
                  setDemoKey(key => key + 1);
                }}
              />
              Redirect to <code className='font-mono text-xs'>/live</code> after joining
            </label>
            <Button
              variant='outline'
              onClick={() => setDemoKey(key => key + 1)}
            >
              Reset
            </Button>
          </div>
        </div>
        <div className='flex justify-center'>
          <Waitlist
            key={demoKey}
            afterJoinWaitlistUrl={redirect ? '/live' : undefined}
          />
        </div>
      </div>
    </MosaicProvider>
  );
}
