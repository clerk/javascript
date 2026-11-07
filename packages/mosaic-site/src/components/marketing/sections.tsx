import Link from 'next/link';

import { MosaicWordmark } from '@/components/marketing/mosaic-mark';
export const principles = [
  {
    title: 'Composable',
    body: 'Every surface is built from tiers you can reach into: AIOs, pages, sections, blocks and components.',
  },
  {
    title: 'Built for agents',
    body: 'Small, predictable pieces with clear names, so an agent can rearrange them as easily as you can.',
  },
  {
    title: 'Yours to change',
    body: 'Swap a block, restyle a component, or replace a whole section without forking the rest.',
  },
];
export function Principles() {
  return (
    <section className='mx-auto grid max-w-[1120px] gap-10 px-6 py-24 md:grid-cols-3'>
      {principles.map(item => (
        <div
          key={item.title}
          className='border-foreground/15 border-t pt-6'
        >
          <h2
            className='text-foreground text-2xl font-semibold tracking-[-0.03em]'
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {item.title}
          </h2>
          <p className='mt-3 text-[15px] leading-6 text-neutral-600 dark:text-neutral-400'>{item.body}</p>
        </div>
      ))}
    </section>
  );
}
export function SiteFooter() {
  return (
    <footer className='border-foreground/10 border-t'>
      <div className='mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-6 px-6 py-10'>
        <MosaicWordmark size={24} />
        <p className='text-sm text-neutral-500'>Mosaic is the next generation of Clerk&apos;s components.</p>
      </div>
    </footer>
  );
}
export function ClosingCta() {
  return (
    <section className='mx-auto flex max-w-[1120px] flex-col items-center gap-8 px-6 pb-32 text-center'>
      <h2
        className='text-[clamp(36px,6vw,72px)] font-semibold leading-[1] tracking-[-0.045em]'
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Rearrange everything
      </h2>
      <Link
        href='/components'
        className='bg-foreground text-background rounded-full px-7 py-4 text-base font-medium transition-transform hover:scale-[1.03]'
      >
        Browse components
      </Link>
    </section>
  );
}
