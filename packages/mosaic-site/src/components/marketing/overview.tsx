'use client';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import clsx from 'clsx';

import { BrowserFrame } from '@/components/marketing/browser-frame';
import { FeatureTabs } from '@/components/marketing/feature-tabs';
import { LinkButton } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { DEFAULT_FRAME, frameUrlFor } from '@/lib/components/frame';

const BLURS = [0.25, 0.5, 1, 2, 4, 8, 16, 32];

function ProgressiveBlur({ className }: { className?: string }) {
  const step = 100 / (BLURS.length + 2);
  return (
    <div
      aria-hidden
      className={clsx('pointer-events-none absolute inset-x-0 bottom-0', className)}
    >
      {BLURS.map((blur, i) => {
        const filter = `blur(${blur}px)`;
        const end = i === BLURS.length - 1 ? '#000 100%' : `#000 ${(i + 2) * step}%, transparent ${(i + 3) * step}%`;
        const mask = `linear-gradient(to bottom, transparent ${i * step}%, #000 ${(i + 1) * step}%, ${end})`;
        return (
          <div
            key={blur}
            className='absolute inset-0'
            style={{ backdropFilter: filter, WebkitBackdropFilter: filter, maskImage: mask, WebkitMaskImage: mask }}
          />
        );
      })}
    </div>
  );
}

export function OverviewSections() {
  return (
    <>
      <section aria-labelledby='overview-principles-heading'>
        <Container className='pt-16 md:pt-20'>
          <h2
            id='overview-principles-heading'
            className='heading-5 sm:heading-4 max-w-2xl text-balance text-gray-950 dark:text-white'
          >
            Built for agents,
            <br />
            ready for production.
          </h2>
          <FeatureTabs />
        </Container>
      </section>
      <section aria-labelledby='overview-components-heading'>
        <Container className='pt-20 sm:pt-32'>
          <div
            className={clsx(
              'relative mx-auto max-w-4xl',
              'h-128 sm:h-180 overflow-hidden lg:h-auto lg:overflow-visible',
              '[mask-image:linear-gradient(to_bottom,#000_calc(100%-13rem),rgb(0_0_0/0.975)_calc(100%-11.5rem),rgb(0_0_0/0.891)_calc(100%-10rem),rgb(0_0_0/0.737)_calc(100%-8.5rem),rgb(0_0_0/0.5)_calc(100%-7rem),rgb(0_0_0/0.264)_calc(100%-5.5rem),rgb(0_0_0/0.11)_calc(100%-4rem),rgb(0_0_0/0.026)_calc(100%-2.5rem),transparent_calc(100%-1rem))]',
              'lg:[mask-image:linear-gradient(to_bottom,#000_40%,rgb(0_0_0/0.975)_46.5625%,rgb(0_0_0/0.891)_53.125%,rgb(0_0_0/0.737)_59.6875%,rgb(0_0_0/0.5)_66.25%,rgb(0_0_0/0.264)_72.8125%,rgb(0_0_0/0.11)_79.375%,rgb(0_0_0/0.026)_85.9375%,transparent_92.5%)]',
            )}
          >
            <MosaicProvider>
              <BrowserFrame
                config={{ ...DEFAULT_FRAME, slug: 'user-profile', url: frameUrlFor('user-profile') }}
                className='w-full'
              />
            </MosaicProvider>
            <ProgressiveBlur className='top-[calc(100%-13rem)] lg:top-[40%]' />
          </div>
          <div className='relative mx-auto -mt-20 flex max-w-xl flex-col items-center text-center lg:-mt-64'>
            <h2
              id='overview-components-heading'
              className='heading-5 sm:heading-4 max-w-md text-balance text-gray-950 dark:text-white'
            >
              Every component, from one avatar to a whole account
            </h2>
            <p className='mt-2.5 text-balance text-base text-gray-600 dark:text-gray-400'>
              Start with a bundled component, then drop down to blocks or your own UI when you need to.
            </p>
          </div>
        </Container>
      </section>
      <section aria-labelledby='overview-cta-heading'>
        <Container className='pb-16 pt-32 sm:pt-48 lg:pb-24'>
          <div className='relative mx-auto max-w-4xl lg:flex lg:items-end lg:justify-between'>
            <div className='max-w-md'>
              <h2
                id='overview-cta-heading'
                className='heading-5 sm:heading-4 mt-10 text-balance text-gray-950 dark:text-white'
              >
                Start with a component
              </h2>
              <p className='mt-2.5 text-balance text-base text-gray-600 dark:text-gray-400'>
                Browse the library, or hand it to your coding agent and let it build.
              </p>
              <div className='mt-8 flex flex-wrap items-center gap-x-4 gap-y-3'>
                <LinkButton
                  href='/components/user-button'
                  color='neutral'
                  arrow
                >
                  Browse components
                </LinkButton>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
