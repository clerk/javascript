import Link from 'next/link';

import { BetaNotice } from '@/components/marketing/beta-notice';
import { ClerkUILogo } from '@/components/marketing/clerk-logo';
import { VersionBadge } from '@/components/marketing/version-badge';
import { Container } from '@/components/ui/container';

const GITHUB_URL = 'https://github.com/clerk/javascript/tree/main/packages/mosaic';

export function HomeHeader() {
  return (
    <header className='relative z-20'>
      <Container className='grid h-14 grid-cols-[1fr_minmax(0,auto)_1fr] items-center gap-4'>
        <div className='flex shrink-0 items-center gap-2'>
          <Link
            href='/'
            aria-label='Clerk UI home'
            className='text-foreground -ml-px flex items-center'
          >
            <ClerkUILogo className='h-[1.125rem]' />
          </Link>
          <VersionBadge />
        </div>
        <BetaNotice />
        <div className='flex items-center gap-2 justify-self-end'>
          <Link
            href='/changelog'
            className='label-3 text-foreground focus-visible:outline-focus shrink-0 transition-colors hover:text-gray-600 dark:hover:text-gray-300'
          >
            Changelog
          </Link>
          <a
            href={GITHUB_URL}
            target='_blank'
            rel='noreferrer'
            aria-label='Clerk UI on GitHub (opens in a new tab)'
            className='rounded-squircle-md focus-visible:outline-focus hover:bg-foreground/[0.06] hover:text-foreground flex size-8 shrink-0 items-center justify-center text-gray-600 transition-colors dark:text-gray-400'
          >
            <GitHubIcon />
          </a>
        </div>
      </Container>
    </header>
  );
}

function GitHubIcon() {
  return (
    <svg
      viewBox='0 0 16 16'
      aria-hidden='true'
      className='size-[1.125rem] fill-current'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M8 0C3.582 0 0 3.672 0 8.203c0 3.623 2.292 6.699 5.471 7.783.4.075.546-.178.546-.396 0-.194-.007-.71-.01-1.394-2.226.495-2.696-1.1-2.696-1.1-.363-.948-.888-1.2-.888-1.2-.726-.508.055-.499.055-.499.803.058 1.225.845 1.225.845.714 1.253 1.873.891 2.328.682.074-.53.28-.891.509-1.096-1.776-.207-3.644-.911-3.644-4.054 0-.895.312-1.628.823-2.201-.082-.208-.357-1.042.079-2.17 0 0 .672-.222 2.2.84A7.485 7.485 0 0 1 8 3.967c.68.003 1.364.094 2.003.276 1.527-1.062 2.198-.841 2.198-.841.437 1.129.161 1.963.08 2.17.512.574.822 1.307.822 2.202 0 3.15-1.871 3.844-3.653 4.048.288.253.543.753.543 1.519 0 1.095-.01 1.98-.01 2.25 0 .219.144.474.55.394a8.031 8.031 0 0 0 3.96-2.989A8.337 8.337 0 0 0 16 8.203C16 3.672 12.418 0 8 0Z'
      />
    </svg>
  );
}
