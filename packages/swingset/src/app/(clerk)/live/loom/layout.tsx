'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { CodeBlock } from '@/components/CodeBlock';

import { LivePageHeader } from '../../live-page-header';
import profileServer from './page?raw';
import passwordServer from './password/page?raw';
import passwordClient from './password/password?raw';
import profileClient from './profile?raw';

const sources = [
  { name: 'Full profile server · page.tsx', source: profileServer },
  { name: 'Full profile client · profile.tsx', source: profileClient },
  { name: 'Standalone Password server · password/page.tsx', source: passwordServer },
  { name: 'Standalone Password client · password/password.tsx', source: passwordClient },
];

export default function LoomDemoLayout({ children }: { children: ReactNode }) {
  const password = usePathname().endsWith('/password');
  return (
    <main className='mx-auto flex w-full max-w-6xl flex-col gap-6 p-3 sm:p-8'>
      <LivePageHeader title={password ? 'Password with Loom' : 'User profile with Loom'}>
        Loom streams profile sections from the server and keeps their display data. Clerk connects account actions.
      </LivePageHeader>
      {children}
      <nav className='flex gap-4 text-sm underline'>
        <Link href='/live/loom'>Full profile</Link>
        <Link href='/live/loom/password'>Standalone Password</Link>
      </nav>
      <details className='min-w-0'>
        <summary className='cursor-pointer text-sm font-medium'>App code</summary>
        <div className='mt-4 space-y-4'>
          <p className='text-muted-foreground text-sm'>
            These are the executing app files. Mosaic imports are private prototype paths. The parent app layout uses
            ClerkProvider. Each client passes useClerk() directly to LoomProvider. Prefetch requires React 19 or Next
            App Router. Loom owns streaming and cache hydration; ClerkJS owns account actions.
          </p>
          {sources.map(({ name, source }) => (
            <section
              key={name}
              className='space-y-2'
            >
              <h2 className='text-sm font-medium'>{name}</h2>
              <CodeBlock className='language-tsx'>{source}</CodeBlock>
            </section>
          ))}
        </div>
      </details>
    </main>
  );
}
