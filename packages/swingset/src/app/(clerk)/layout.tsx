import { ClerkProvider } from '@clerk/nextjs';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { LiveUserButton } from './live-user-button';

function LiveChrome({ children, userButton }: { children: ReactNode; userButton?: ReactNode }) {
  return (
    <div className='flex min-h-svh flex-col'>
      <header className='bg-background flex h-12 items-center justify-between gap-3 border-b px-4'>
        <div className='flex items-center gap-3'>
          <Link
            href='/'
            className='text-muted-foreground hover:text-foreground text-sm'
          >
            ← Swingset
          </Link>
          <span className='text-muted-foreground text-xs'>Live</span>
        </div>
        {userButton}
      </header>
      {children}
    </div>
  );
}

export default function ClerkLayout({ children }: { children: ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return (
      <LiveChrome>
        <div className='mx-auto flex w-full max-w-3xl flex-col gap-2 p-3 sm:p-8'>
          <h1 className='text-xl font-semibold'>Live</h1>
          <p className='text-muted-foreground text-sm'>
            To access sign-in, sign-up, and live pages, set up a publishable key.
          </p>
          <p className='text-muted-foreground text-sm'>
            Copy <code className='font-mono text-xs'>packages/swingset/.env.example</code> to{' '}
            <code className='font-mono text-xs'>packages/swingset/.env.local</code> and set{' '}
            <code className='font-mono text-xs'>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>, then restart Swingset.
          </p>
          <p className='text-muted-foreground text-sm'>
            <code className='font-mono text-xs'>CLERK_SECRET_KEY</code> is optional. Add it for SSO and OAuth redirects.
          </p>
        </div>
      </LiveChrome>
    );
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      signInUrl='/sign-in'
      signUpUrl='/sign-up'
      signInFallbackRedirectUrl='/live/reverification'
      signUpFallbackRedirectUrl='/live/reverification'
      afterSignOutUrl='/live/reverification'
    >
      <LiveChrome userButton={<LiveUserButton />}>{children}</LiveChrome>
    </ClerkProvider>
  );
}
