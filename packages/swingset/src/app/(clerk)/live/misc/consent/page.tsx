'use client';

import { Button } from '@clerk/mosaic/components/button';
import { Consent } from '@clerk/mosaic/features/consent/consent';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useSyncExternalStore } from 'react';

import { LivePageHeader } from '../../../live-page-header';

const CALLBACK_PATH = '/live/misc/consent/callback';
const DEFAULT_SCOPE = 'openid profile email';

function subscribe() {
  return () => {};
}

function useOrigin() {
  return useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => '',
  );
}

function RequestForm() {
  const search = useSearchParams();
  const origin = useOrigin();
  if (!origin) {
    return null;
  }

  return (
    <form
      method='get'
      className='flex flex-col gap-3 text-sm'
    >
      <label className='flex flex-col gap-1'>
        <span className='font-medium'>Client ID</span>
        <input
          name='client_id'
          required
          defaultValue={search.get('client_id') ?? ''}
          className='rounded-md border px-2 py-1 font-mono text-xs'
        />
      </label>
      <label className='flex flex-col gap-1'>
        <span className='font-medium'>Scopes</span>
        <input
          name='scope'
          defaultValue={search.get('scope') ?? DEFAULT_SCOPE}
          className='rounded-md border px-2 py-1 font-mono text-xs'
        />
      </label>
      <label className='flex flex-col gap-1'>
        <span className='font-medium'>Redirect URI</span>
        <input
          name='redirect_uri'
          required
          defaultValue={search.get('redirect_uri') ?? `${origin}${CALLBACK_PATH}`}
          className='rounded-md border px-2 py-1 font-mono text-xs'
        />
      </label>
      <input
        type='hidden'
        name='response_type'
        value='code'
      />
      <input
        type='hidden'
        name='state'
        value={search.get('state') ?? 'swingset'}
      />
      <div>
        <Button type='submit'>Load consent</Button>
      </div>
    </form>
  );
}

function LiveConsent() {
  const search = useSearchParams();
  if (!search.get('client_id')) {
    return null;
  }
  return <Consent key={search.toString()} />;
}

export default function ConsentLivePage() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
        <div className='flex flex-col gap-4'>
          <LivePageHeader title='Consent'>
            The connected consent screen. It needs an OAuth application in this Clerk instance whose redirect URIs
            include the redirect URI below. Approving or denying posts to Clerk, which redirects to that URI.
          </LivePageHeader>
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
          <Suspense>
            <RequestForm />
          </Suspense>
        </div>
        <div className='flex justify-center'>
          <Suspense>
            <LiveConsent />
          </Suspense>
        </div>
      </div>
    </MosaicProvider>
  );
}
