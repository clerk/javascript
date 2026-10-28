'use client';

import { Icon } from '@clerk/mosaic/components/icon';
import { UserProfile } from '@clerk/mosaic/features/user-profile/user-profile';
import { Bolt } from '@clerk/mosaic/icons/glyphs/bolt';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function UserProfileLivePage() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <MosaicProvider>
      <div className='mx-auto flex w-full max-w-5xl flex-col gap-6 p-3 sm:p-8'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-xl font-semibold'>User profile</h1>
          <p className='text-muted-foreground text-sm'>
            The connected user profile, with the account, security, and API keys pages for the signed-in account.
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
        <UserProfile
          fallback={<p className='text-muted-foreground text-sm'>Loading…</p>}
          customPages={[
            {
              path: 'usage',
              label: 'Usage',
              icon: (
                <Icon
                  glyph={Bolt}
                  size='sm'
                />
              ),
              keywords: ['quota'],
              content: <UsagePage />,
            },
          ]}
        />
      </div>
    </MosaicProvider>
  );
}

function UsagePage() {
  return (
    <div className='flex flex-col gap-6'>
      <UserProfile.SearchTarget
        label='Rate limits'
        keywords={['throttle', 'requests']}
        render={<section className='flex flex-col gap-1 rounded-lg border p-4' />}
      >
        <h3 className='font-semibold'>Rate limits</h3>
        <p className='text-muted-foreground text-sm'>1,000 requests per minute.</p>
      </UserProfile.SearchTarget>
      <UserProfile.SearchTarget
        label='Seats'
        keywords={['members']}
        render={<section className='flex flex-col gap-1 rounded-lg border p-4' />}
      >
        <h3 className='font-semibold'>Seats</h3>
        <p className='text-muted-foreground text-sm'>4 of 10 seats used.</p>
      </UserProfile.SearchTarget>
    </div>
  );
}
