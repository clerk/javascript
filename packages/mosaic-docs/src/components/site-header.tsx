import Link from 'next/link';

import { site } from '@/lib/site';

const links = [
  { title: 'Docs', href: '/docs' },
  { title: 'Changelog', href: site.changelogUrl },
  { title: 'GitHub', href: site.githubUrl },
];

export function SiteHeader() {
  return (
    <header className='sticky top-0 z-10 border-b border-neutral-100 bg-white/90 backdrop-blur'>
      <div className='mx-auto grid h-14 max-w-screen-2xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6'>
        <Link
          href='/'
          className='text-sm font-semibold text-neutral-950'
        >
          {site.name}
        </Link>
        <nav className='flex items-center gap-6 text-sm text-neutral-600'>
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className='transition-colors hover:text-neutral-950'
            >
              {link.title}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
