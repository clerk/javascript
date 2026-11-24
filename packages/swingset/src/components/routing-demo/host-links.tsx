'use client';

import type { RoutingMode } from '@clerk/mosaic/routing/use-mosaic-location';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';

/** One component's entry, as the host would write it: the base it routes under and the segment. */
export interface HostEntry {
  base: string;
  parts: string;
}

/**
 * The URL a host would link to for these entries in this mode, in the shape the carrier reads:
 * the pathname under the page in path mode, one param per base in hash and query mode, and the
 * query form in virtual mode, which each owner reads into memory and removes. The pathname holds
 * one entry, so path mode takes the first.
 */
export function hostUrl({
  mode,
  pagePath,
  entries,
  query = {},
}: {
  mode: RoutingMode;
  pagePath: string;
  entries: readonly HostEntry[];
  query?: Record<string, string>;
}): string {
  const search = new URLSearchParams({ mode, ...query });
  const key = (base: string) => base.replaceAll('/', '.');
  const pairs = entries.map(({ base, parts }) => `${key(base)}=${parts}`);
  switch (mode) {
    case 'path': {
      const first = entries[0];
      const pathname = first && first.parts !== '' ? `${pagePath}/${first.parts}` : pagePath;
      return `${pathname}?${search}`;
    }
    case 'hash':
      return `${pagePath}?${search}#${pairs.join('&')}`;
    case 'virtual':
    case 'query':
      return `${pagePath}?${search}&${pairs.join('&')}`;
  }
}

export function HostLinks({ links }: { links: readonly { label: string; href: string | undefined }[] }) {
  const shown = links.filter((link): link is { label: string; href: string } => link.href !== undefined);
  if (shown.length === 0) {
    return null;
  }
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <span className='text-muted-foreground text-sm'>Links from the host:</span>
      {shown.map(({ label, href }) => (
        <Link
          key={href}
          href={href}
          title={href}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
