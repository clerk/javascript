'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { GitHubLink } from '@/components/github-link';
import { MobileNav } from '@/components/mobile-nav';
import type { NavGroup } from '@/lib/navigation';
import { site } from '@/lib/site';

const tabs = [
  { title: 'Docs', href: '/docs' },
  { title: 'Changelog', href: site.changelogUrl },
];

export function SiteHeader({ navigation }: { navigation: NavGroup[] }) {
  const pathname = usePathname();

  return (
    <header className='bg-background/90 sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 px-4 backdrop-blur sm:gap-3 md:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(max-content,1fr)]'>
      <div className='flex min-w-0 items-center gap-2 sm:gap-3 lg:col-start-1'>
        <MobileNav
          tabs={tabs}
          groups={navigation}
        />
        <Link
          href='/'
          className='text-foreground inline-flex min-w-0 items-center gap-2 text-base font-semibold'
        >
          <span className='truncate'>{site.name}</span>
        </Link>
      </div>
      <nav
        aria-label='Sections'
        className='hidden shrink-0 gap-1 md:flex lg:col-start-2'
      >
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={pathname.startsWith(tab.href) ? 'page' : undefined}
            className='text-muted-foreground hover:bg-muted hover:text-foreground aria-[current=page]:text-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors'
          >
            {tab.title}
          </Link>
        ))}
      </nav>
      <div className='flex-1 lg:hidden' />
      <div className='flex shrink-0 items-center gap-1 lg:col-start-3 lg:justify-self-end'>
        <GitHubLink iconClassName='size-[18px]' />
      </div>
    </header>
  );
}
