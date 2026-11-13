'use client';

import { Switcher } from '@clerk/mosaic/features/switcher/switcher';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function SwitcherLivePage() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <MosaicProvider experimental={{ newProfiles: true }}>
      <div className='mx-auto flex w-full max-w-5xl flex-col gap-6 p-3 sm:p-8'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-xl font-semibold'>Switcher</h1>
          <p className='text-muted-foreground text-sm'>
            The connected switcher in each mode, with the signed-in account, its organizations, and the profiles it
            opens.
          </p>
        </div>
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
        <div className='flex flex-wrap items-center gap-4'>
          <Switcher />
          <Switcher mode='user' />
          <Switcher mode='organization' />
        </div>
      </div>
    </MosaicProvider>
  );
}
