'use client';

import type { Clerk } from '@clerk/clerk-js';
import { LoomProvider, useLoom, useSessions } from '@clerk/loom/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function LoomPage() {
  const [clerk, setClerk] = useState<Clerk | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!publishableKey) {
      return;
    }
    let active = true;
    void import('@clerk/clerk-js')
      .then(async ({ Clerk }) => {
        if (!active) {
          return;
        }
        const instance = new Clerk(publishableKey);
        await instance.load();
        if (active) {
          setClerk(instance);
        }
      })
      .catch(() => {
        if (active) {
          setError('Could not load Clerk. Reload this page to retry.');
        }
      });
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
    <main className='mx-auto max-w-2xl space-y-6 p-8'>
      <h1 className='text-2xl font-semibold'>Loom active devices</h1>
      <Link
        href='/live/loom'
        className='underline'
      >
        User profile server preview
      </Link>
      <LoomProvider
        clerk={clerk}
        fallback={
          <button
            type='button'
            onClick={() => void clerk.redirectToSignIn({ redirectUrl: '/loom' })}
          >
            Sign in to view devices
          </button>
        }
      >
        <Devices />
      </LoomProvider>
    </main>
  );
}

function Devices() {
  const loom = useLoom();
  const [show, setShow] = useState(false);
  return (
    <div className='space-y-4'>
      <button
        type='button'
        onMouseEnter={() => void loom.prefetch()}
        onFocus={() => void loom.prefetch()}
        onClick={() => setShow(value => !value)}
      >
        {show ? 'Hide devices' : 'Show devices'}
      </button>
      {show && <DeviceList />}
    </div>
  );
}

function DeviceList() {
  const loom = useLoom();
  const query = useSessions();
  return (
    <section>
      <button
        type='button'
        disabled={query.isFetching}
        onClick={() => void query.refetch()}
      >
        Refresh devices
      </button>
      {query.isPending ? <p role='status'>Loading devices</p> : null}
      {query.error ? <p role='alert'>Could not load devices. Refresh to retry.</p> : null}
      {query.data?.length === 0 ? <p>No active devices</p> : null}
      <ul>
        {query.data?.map(session => (
          <li key={session.id}>
            {session.id === loom.scope.sessionId ? 'This device' : session.latestActivity.deviceType || 'Other device'}
          </li>
        ))}
      </ul>
    </section>
  );
}
