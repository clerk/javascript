'use client';

import { TaskSetupMFA } from '@clerk/mosaic/features/task-setup-mfa/task-setup-mfa';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useSession } from '@clerk/nextjs';
import Link from 'next/link';
import { useState } from 'react';

import { LivePageHeader } from '../../../live-page-header';

export default function TaskSetupMfaLivePage() {
  const { isLoaded, session } = useSession();
  const onTask = session?.currentTask?.key === 'setup-mfa';
  const [started, setStarted] = useState(false);
  if (onTask && !started) {
    setStarted(true);
  }

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <LivePageHeader title='Task: set up MFA'>
          Resolves the signed-in session&apos;s real <code className='font-mono text-xs'>setup-mfa</code> task. The
          application needs MFA required at sign-up, and the user needs to have signed in without a second factor.
        </LivePageHeader>
        {isLoaded && !session ? (
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
        {isLoaded && session && !started ? (
          <p className='rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm'>
            This session has no <code className='font-mono text-xs'>setup-mfa</code> task. Turn on required MFA in the
            Clerk Dashboard, then sign in as a user without a second factor.
          </p>
        ) : null}
        {started ? (
          <div className='flex justify-center'>
            <TaskSetupMFA
              redirectUrlComplete='/live'
              fallback={<p className='text-muted-foreground text-sm'>Loading…</p>}
            />
          </div>
        ) : null}
      </div>
    </MosaicProvider>
  );
}
