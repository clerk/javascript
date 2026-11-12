'use client';

import { UserButton } from '@clerk/mosaic/features/user-button/user-button';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import type { MosaicRouting } from '@clerk/mosaic/routing/router-adapter';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { AddressBar } from '@/components/address-bar';
import { buttonVariants } from '@/components/ui/button';
import { nextRouterAdapter } from '@/lib/mosaic-next-router-adapter';

import { LivePageHeader } from '../../../../live-page-header';

const pagePath = '/live/user-button/user-button';
const modes = ['virtual', 'path', 'hash', 'query'] as const;
type ModalMode = (typeof modes)[number];

function toMode(value: string | null): ModalMode {
  return modes.find(mode => mode === value) ?? 'virtual';
}

export default function UserButtonLivePage() {
  const { isLoaded, isSignedIn } = useUser();
  const mode = toMode(useSearchParams().get('mode'));
  const routing: MosaicRouting = {
    adapter: nextRouterAdapter,
    modals: mode === 'virtual' ? undefined : { routing: mode, path: pagePath },
  };

  return (
    <MosaicProvider
      key={mode}
      experimental={{ newProfiles: true }}
      routing={routing}
    >
      <div className='mx-auto flex w-full max-w-5xl flex-col gap-6 p-3 sm:p-8'>
        <LivePageHeader title='User button'>
          The connected user button, with the signed-in account, its organizations, and the profiles it opens. Pick
          where the profile modals keep their open page: in memory, in the pathname under this page, in the hash, or in
          the query string.
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
            aria-label='Modal routing'
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
        <div className='flex flex-wrap items-center gap-4'>
          <UserButton />
          <UserButton combined={false} />
        </div>
      </div>
    </MosaicProvider>
  );
}
