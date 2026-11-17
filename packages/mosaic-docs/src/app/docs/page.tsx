import type { Metadata } from 'next';

import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Introduction',
};

export default function IntroductionPage() {
  return (
    <article>
      <h1 className='text-4xl font-medium tracking-tight'>Introduction</h1>
      <p className='mt-4 text-lg text-neutral-600'>{site.description}</p>
      <p className='mt-6 text-neutral-700'>
        Mosaic is split into components, which are styled and ready to use, primitives, which are headless building
        blocks, and hooks.
      </p>
    </article>
  );
}
