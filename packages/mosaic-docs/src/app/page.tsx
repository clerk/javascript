import Link from 'next/link';
import type { ReactNode } from 'react';

import { CopyButton } from '@/components/copy-button';
import { LandingFooter } from '@/components/landing-footer';
import { site } from '@/lib/site';

const installCommand = 'pnpm add @clerk/mosaic';

function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className='text-accent hover:text-foreground inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium'
    >
      {children}
      <svg
        aria-hidden='true'
        className='size-3.5 shrink-0'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        viewBox='0 0 24 24'
      >
        <path d='m9 18 6-6-6-6' />
      </svg>
    </Link>
  );
}

export default function HomePage() {
  return (
    <>
      <main className='flex-1'>
        <section className='pb-16 pt-16 sm:pb-20 sm:pt-24'>
          <div className='max-w-350 mx-auto px-6'>
            <h1 className='mt-6 max-w-3xl text-balance text-4xl font-medium sm:text-5xl lg:text-6xl'>
              <span className='block'>Mosaic</span>
              <span className='text-muted-foreground block'>Clerk&apos;s component library</span>
            </h1>
            <p className='text-muted-foreground mt-8 max-w-xl text-balance text-lg'>{site.description}</p>
            <div className='mt-8 flex flex-wrap items-center gap-x-6 gap-y-4'>
              <div className='rounded-docs border-border flex w-full max-w-xs items-center gap-2 border py-1.5 pl-3 pr-1.5 font-mono text-sm'>
                <span
                  aria-hidden='true'
                  className='text-muted-foreground'
                >
                  $
                </span>
                <code className='flex-1'>{installCommand}</code>
                <CopyButton text={installCommand} />
              </div>
              <div className='flex items-center gap-6'>
                <TextLink href='/docs'>Get started</TextLink>
                <TextLink href={site.githubUrl}>View on GitHub</TextLink>
              </div>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </>
  );
}
