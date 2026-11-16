import './globals.css';

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';

import { BackBanner } from '@/components/BackBanner';
import { BetaNotice, GitHubLink } from '@/components/BetaNotice';
import { Logo } from '@/components/Logo';
import { MobileNav, Sidebar, type SidebarGroup } from '@/components/Sidebar';
import { getManifest, itemHref, SECTIONS } from '@/lib/content';

const sans = Geist({ subsets: ['latin'], variable: '--font-geist' });
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  metadataBase: new URL('https://mosaic.clerk.com'),
  title: 'Mosaic Design System | Clerk',
  description: 'Components, primitives, and hooks from Mosaic, the design system behind Clerk’s user interfaces.',
  robots: { index: false, follow: false },
};

function getGroups(): Array<SidebarGroup> {
  const manifest = getManifest();
  return [
    { title: 'Overview', items: [{ title: 'Introduction', href: '/' }] },
    ...SECTIONS.map(section => ({
      title: section.title,
      href: `/${section.slug}`,
      items: (manifest[section.slug] ?? []).map(entry => ({
        title: entry.title,
        href: itemHref(section.slug, entry.slug),
      })),
    })),
  ];
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const groups = getGroups();

  return (
    <html
      lang='en'
      className={`${sans.variable} ${mono.variable}`}
    >
      <body className='min-h-dvh bg-white font-sans text-gray-950 antialiased dark:bg-gray-950 dark:text-white'>
        <BackBanner />
        <header className='sticky top-0 z-50 h-14 border-b border-gray-950/5 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-gray-950/80'>
          <div className='mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6'>
            <div className='flex shrink-0 items-center gap-4'>
              <a
                href='https://clerk.com'
                aria-label='Clerk home'
              >
                <Logo className='h-4.5 w-auto' />
              </a>
              <span className='h-4 w-px bg-gray-950/10 dark:bg-white/15' />
              <Link
                href='/'
                className='text-sm font-medium text-gray-950 dark:text-white'
              >
                Mosaic
              </Link>
            </div>
            <div className='flex min-w-0 items-center gap-2'>
              <BetaNotice />
              <GitHubLink />
              <MobileNav groups={groups} />
            </div>
          </div>
        </header>
        <div className='mx-auto flex max-w-7xl gap-10 px-4 sm:px-6'>
          <Sidebar groups={groups} />
          <main
            id='main'
            className='min-w-0 flex-1 pb-24 pt-10'
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
