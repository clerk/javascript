import Link from 'next/link';

import { ClerkUILogo } from '@/components/marketing/clerk-logo';
import { NpmDownloads } from '@/components/marketing/npm-downloads';
import { VersionBadge } from '@/components/marketing/version-badge';
import { Container } from '@/components/ui/container';

export function HomeHeader() {
  return (
    <header className='relative z-20'>
      <Container className='flex h-14 items-center justify-between gap-4'>
        <div className='flex items-center gap-2'>
          <Link
            href='/'
            aria-label='Clerk UI home'
            className='text-foreground -ml-px flex items-center'
          >
            <ClerkUILogo className='h-[1.125rem]' />
          </Link>
          <VersionBadge />
        </div>
        <div className='flex items-baseline gap-4'>
          <NpmDownloads className='max-sm:hidden' />
          <a
            href='https://www.npmjs.com/package/@clerk/mosaic'
            target='_blank'
            rel='noreferrer'
            className='label-3 rounded-squircle-md focus-visible:outline-focus inline-flex h-[1.625rem] shrink-0 items-center gap-1 bg-gray-800 px-2.5 text-white transition-colors hover:bg-gray-700 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100'
          >
            <span className='trim-cap'>View on npm</span>
            <ExternalLinkIcon />
          </a>
        </div>
      </Container>
    </header>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      className='-mr-0.5 size-4 shrink-0'
    >
      <path d='M11.25 4.75H6.75C5.64543 4.75 4.75 5.64543 4.75 6.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25H17.25C18.3546 19.25 19.25 18.3546 19.25 17.25V12.75M7.75 16.25L12.25 11.75M12.25 15.125V11.75H8.875M15.75 9.25H18.25C18.8023 9.25 19.25 8.80228 19.25 8.25V5.75C19.25 5.19772 18.8023 4.75 18.25 4.75H15.75C15.1977 4.75 14.75 5.19772 14.75 5.75V8.25C14.75 8.80228 15.1977 9.25 15.75 9.25Z' />
    </svg>
  );
}
