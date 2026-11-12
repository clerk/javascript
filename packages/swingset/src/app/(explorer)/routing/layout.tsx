'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Suspense } from 'react';

import { routingDemos } from '@/components/routing-demo/demos';
import { buttonVariants } from '@/components/ui/button';

export default function RoutingLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className='flex flex-col'>
      <nav
        aria-label='Routing demos'
        className='mx-auto flex w-full max-w-5xl flex-wrap gap-1 px-3 pt-3 sm:px-8 sm:pt-6'
      >
        {routingDemos.map(({ href, label }) => {
          const active = href === '/routing' ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={buttonVariants({ variant: active ? 'secondary' : 'ghost', size: 'sm' })}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      <Suspense fallback={null}>{children}</Suspense>
    </div>
  );
}
