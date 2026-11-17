'use client';

import { UserProfile } from '@clerk/mosaic/features/user-profile/user-profile';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import type { MosaicRouting } from '@clerk/mosaic/routing/router-adapter';
import type { MosaicRoutingMode } from '@clerk/mosaic/routing/use-mosaic-location';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { AddressBar } from '@/components/address-bar';
import { buttonVariants } from '@/components/ui/button';
import { nextRouterAdapter } from '@/lib/mosaic-next-router-adapter';

import { LivePageHeader } from '../../../../live-page-header';

const pagePath = '/live/user-profile/user-profile';
const modes: MosaicRoutingMode[] = ['virtual', 'path', 'hash', 'query'];
const routing: MosaicRouting = { adapter: nextRouterAdapter };

function toMode(value: string | null): MosaicRoutingMode {
  return modes.find(mode => mode === value) ?? 'virtual';
}

export default function UserProfileLivePage() {
  const { isLoaded, isSignedIn } = useUser();
  const mode = toMode(useSearchParams().get('mode'));

  return (
    <MosaicProvider routing={routing}>
      <div className='mx-auto flex w-full max-w-5xl flex-col gap-6 p-3 sm:p-8'>
        <LivePageHeader title='User profile'>
          The connected user profile, with the account, security, and API keys pages for the signed-in account. Pick
          where it keeps the open page: in memory, in the pathname, in the hash, or in the query string.
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
        <div className='flex flex-col gap-2'>
          <nav
            aria-label='Routing'
            className='flex flex-wrap gap-1'
          >
            {modes.map(option => (
              <Link
                key={option}
                href={`${pagePath}?mode=${option}`}
                aria-current={option === mode ? 'page' : undefined}
                className={buttonVariants({ variant: option === mode ? 'secondary' : 'ghost', size: 'sm' })}
              >
                {option}
              </Link>
            ))}
          </nav>
          <AddressBar />
        </div>
        <UserProfile
          key={mode}
          routing={mode}
          path={mode === 'path' ? pagePath : undefined}
          fallback={<p className='text-muted-foreground text-sm'>Loading…</p>}
        />
      </div>
    </MosaicProvider>
  );
}
