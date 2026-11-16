import type { Metadata } from 'next';

import { HomeHeader } from '@/components/marketing/home-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { Container } from '@/components/ui/container';
import { InlineCode } from '@/components/ui/inline-code';
import { CHANGELOG } from '@/lib/changelog';

export const metadata: Metadata = {
  title: 'Changelog · Clerk UI',
  description: 'What’s new in Clerk UI while it’s in beta.',
};

const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

export default function ChangelogPage() {
  return (
    <>
      <HomeHeader />
      <main className='relative isolate overflow-x-clip'>
        <Container className='pb-32 pt-16'>
          <div className='max-w-2xl'>
            <h1 className='heading-3 sm:heading-2'>Changelog</h1>
            <p className='body-2 mt-2 text-balance text-neutral-600 dark:text-neutral-400'>
              Clerk UI is in beta, so minor releases can include breaking changes. Highlights from each{' '}
              <code className='code-inline'>@clerk/mosaic</code> release are below.
            </p>
          </div>
          <ol className='mt-12 max-w-2xl'>
            {CHANGELOG.map(entry => (
              <li
                key={entry.version}
                className='border-border border-t py-8'
              >
                <div className='flex items-baseline gap-3'>
                  <h2 className='heading-5 tabular-nums'>v{entry.version}</h2>
                  <time
                    dateTime={entry.date}
                    className='body-3 text-gray-600 dark:text-gray-400'
                  >
                    {dateFormat.format(new Date(entry.date))}
                  </time>
                </div>
                <ul className='mt-4 list-disc space-y-2 pl-5'>
                  {entry.items.map(item => (
                    <li
                      key={item.pr}
                      className='body-2 text-neutral-700 dark:text-neutral-300'
                    >
                      {item.breaking && (
                        <span className='tag-2 mr-2 inline-block rounded-[1px] bg-gray-950 px-1 align-middle leading-[12px] text-yellow-500 dark:bg-yellow-500 dark:text-gray-950'>
                          Breaking
                        </span>
                      )}
                      <InlineCode text={item.text} />{' '}
                      <a
                        href={`https://github.com/clerk/javascript/pull/${item.pr}`}
                        target='_blank'
                        rel='noreferrer'
                        className='text-gray-600 underline underline-offset-2 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                      >
                        #{item.pr}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <a
            href='https://github.com/clerk/javascript/blob/main/packages/mosaic/CHANGELOG.md'
            target='_blank'
            rel='noreferrer'
            className='label-3 text-foreground mt-4 inline-block underline underline-offset-2'
          >
            Full changelog on GitHub
          </a>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
