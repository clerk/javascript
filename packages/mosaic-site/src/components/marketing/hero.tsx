import Link from 'next/link';

import { HeroReshuffle } from '@/components/marketing/hero-reshuffle';
export function Hero() {
  return (
    <section className='relative isolate flex flex-col items-center px-6 pb-24 pt-6 text-center'>
      <HeroReshuffle className='h-[min(52vh,520px)] w-full max-w-[960px]' />

      <h1
        className='text-foreground mt-4 text-[clamp(44px,7vw,88px)] font-semibold leading-[0.98] tracking-[-0.045em]'
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Identity without limits
      </h1>
      <p className='mt-6 max-w-[560px] text-lg leading-[30px] text-neutral-600 dark:text-neutral-400'>
        Sign-in, profiles, consent and agent experiences. Composable components made to be rearranged, restyled and
        replaced.
      </p>
      <div className='mt-9 flex items-center gap-7'>
        <Link
          href='/components'
          className='bg-foreground text-background rounded-full px-7 py-4 text-base font-medium transition-transform hover:scale-[1.03]'
        >
          Browse components
        </Link>
        <Link
          href='/tools/brand'
          className='text-foreground text-base font-medium transition-colors hover:text-neutral-600 dark:hover:text-neutral-400'
        >
          Brand overview →
        </Link>
      </div>
    </section>
  );
}
