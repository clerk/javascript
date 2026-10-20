'use client';

import type { Clerk } from '@clerk/clerk-js';
import { ClerkLoomProvider, useLoom } from '@clerk/loom/react';
import { Button } from '@clerk/mosaic/components/button';
import { LoomActiveDevices } from '@clerk/mosaic/experimental/loom/loom-active-devices';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { ClerkProvider, SignIn, useUser } from '@clerk/react';
import { useEffect, useState } from 'react';

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function LoomPage() {
  const [clerk, setClerk] = useState<Clerk | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    if (publishableKey) {
      void import('@clerk/clerk-js')
        .then(({ Clerk }) => {
          if (active) {
            setClerk(new Clerk(publishableKey));
          }
        })
        .catch(() => {
          if (active) {
            setError('Could not load Clerk. Reload this page to retry.');
          }
        });
    }
    return () => {
      active = false;
    };
  }, []);
  if (!publishableKey) {
    return <p>Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to run this example.</p>;
  }
  if (error) {
    return <p role='alert'>{error}</p>;
  }
  if (!clerk) {
    return <p>Loading Clerk</p>;
  }
  return (
    <ClerkProvider
      Clerk={clerk}
      publishableKey={publishableKey}
    >
      <main className='mx-auto max-w-2xl space-y-6 p-8'>
        <h1 className='text-2xl font-semibold'>Loom active devices</h1>
        <Account host={clerk} />
      </main>
    </ClerkProvider>
  );
}

function Account({ host }: { host: Clerk }) {
  const { isLoaded, isSignedIn } = useUser();
  if (!isLoaded) {
    return <p>Loading account</p>;
  }
  if (!isSignedIn) {
    return <SignIn routing='hash' />;
  }
  return (
    <ClerkLoomProvider
      host={host}
      fallback={<p>Loading devices</p>}
    >
      <MosaicProvider>
        <Devices />
      </MosaicProvider>
    </ClerkLoomProvider>
  );
}

function Devices() {
  const loom = useLoom();
  const [show, setShow] = useState(false);
  return (
    <div className='space-y-4'>
      <Button
        type='button'
        variant='outline'
        onMouseEnter={() => void loom.prefetch()}
        onFocus={() => void loom.prefetch()}
        onClick={() => setShow(value => !value)}
      >
        {show ? 'Hide devices' : 'Show devices'}
      </Button>
      {show && <LoomActiveDevices />}
    </div>
  );
}
