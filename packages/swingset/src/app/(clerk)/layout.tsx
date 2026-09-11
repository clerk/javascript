import { ClerkProvider } from '@clerk/nextjs';
import type { ReactNode } from 'react';

import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

import { LiveSidebar } from './live-sidebar';
import { LiveUserButton } from './live-user-button';

function LiveChrome({ children, userButton }: { children: ReactNode; userButton?: ReactNode }) {
  return (
    <SidebarProvider>
      <LiveSidebar />
      <SidebarInset>
        <header className='bg-background sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b px-4'>
          <SidebarTrigger className='-ml-1' />
          <Separator
            orientation='vertical'
            className='data-vertical:h-4 data-vertical:self-auto mr-2'
          />
          <span className='text-muted-foreground text-xs'>Live Sandbox</span>
          <div className='ml-auto'>{userButton}</div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function ClerkLayout({ children }: { children: ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return (
      <LiveChrome>
        <div className='mx-auto flex w-full max-w-3xl flex-col gap-2 p-3 sm:p-8'>
          <h1 className='text-xl font-semibold'>Live Sandbox</h1>
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
      signInFallbackRedirectUrl='/live'
      signUpFallbackRedirectUrl='/live'
      afterSignOutUrl='/live'
    >
      <LiveChrome userButton={<LiveUserButton />}>{children}</LiveChrome>
    </ClerkProvider>
  );
}
