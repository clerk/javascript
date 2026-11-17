import Link from 'next/link';

import { site } from '@/lib/site';

export default function HomePage() {
  return (
    <main className='mx-auto max-w-5xl px-4 py-24 sm:px-6'>
      <p className='text-xs text-neutral-500'>Clerk design system</p>
      <h1 className='mt-6 text-5xl font-medium tracking-tight sm:text-6xl'>
        Mosaic
        <br />
        <span className='text-neutral-400'>Clerk&apos;s component library</span>
      </h1>
      <p className='mt-8 max-w-xl text-lg text-neutral-600'>{site.description}</p>
      <div className='mt-8 flex flex-wrap items-center gap-6 text-sm font-medium'>
        <Link
          href='/docs'
          className='rounded-md bg-neutral-950 px-4 py-2.5 text-white transition-colors hover:bg-neutral-800'
        >
          Get started
        </Link>
        <Link
          href={site.githubUrl}
          className='text-neutral-600 transition-colors hover:text-neutral-950'
        >
          View on GitHub
        </Link>
      </div>
    </main>
  );
}
