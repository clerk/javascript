'use client';

import type { Clerk } from '@clerk/clerk-js';
import { LoomProvider } from '@clerk/loom/react';
import { LoomActiveDevices } from '@clerk/mosaic/experimental/loom/loom-active-devices';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useClerk, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { LivePageHeader } from '../../../live-page-header';

type ClerkBridgeState = { kind: 'loading' } | { kind: 'ready'; clerk: Clerk } | { kind: 'unavailable' };

export function ActiveDevicesLivePreview() {
  const sdk = useClerk();
  const { isLoaded, isSignedIn } = useUser();
  const [state, setState] = useState<ClerkBridgeState>({ kind: 'loading' });

  useEffect(() => {
    if (!sdk.loaded) {
      return;
    }
    const clerk = window.Clerk;
    if (clerk?.loaded && typeof clerk.getFapiClient === 'function') {
      setState({ kind: 'ready', clerk });
    } else {
      setState({ kind: 'unavailable' });
    }
  }, [sdk.loaded]);

  const signedOut = isLoaded && !isSignedIn;
  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <LivePageHeader title='Active devices'>Review the devices signed in to your account.</LivePageHeader>
        {signedOut ? (
          <p className='text-muted-foreground text-sm'>
            <Link
              href='/sign-in'
              className='text-foreground underline underline-offset-4'
            >
              Sign in
            </Link>{' '}
            to review your active devices.
          </p>
        ) : state.kind === 'unavailable' ? (
          <p role='alert'>The live devices preview is unavailable because the Clerk connection is missing.</p>
        ) : (
          <LoomProvider
            clerk={state.kind === 'ready' ? state.clerk : null}
            fallback={<p className='text-muted-foreground text-sm'>Loading devices…</p>}
          >
            <LoomActiveDevices />
          </LoomProvider>
        )}
      </div>
    </MosaicProvider>
  );
}
