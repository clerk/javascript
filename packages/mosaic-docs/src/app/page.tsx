import Link from 'next/link';

import { CodeBlock } from '@/components/CodeBlock';
import { ItemGrid } from '@/components/docs';
import { getManifest, SECTIONS } from '@/lib/content';

export default function MosaicIndexPage() {
  const manifest = getManifest();

  return (
    <div className='max-w-4xl'>
      <h1 className='heading-4 text-gray-950 dark:text-white'>Mosaic</h1>
      <p className='mt-3 max-w-2xl text-base/7 text-gray-600 dark:text-gray-400'>
        Mosaic is the design system behind Clerk’s next generation of user interface components. It’s the components,
        headless primitives, and hooks that Clerk’s sign-in, user profile, and organization screens are built from.
      </p>
      <p className='mt-3 max-w-2xl text-base/7 text-gray-600 dark:text-gray-400'>
        Mosaic ships as <code className='font-mono text-[0.875em] text-gray-950 dark:text-white'>@clerk/mosaic</code>,
        an experimental package: breaking changes can land in minor releases, so pin your version.
      </p>

      <div className='mt-6 max-w-2xl'>
        <CodeBlock
          lang='shell'
          code='npm install @clerk/mosaic'
        />
      </div>

      <div className='mt-10 grid gap-3 sm:grid-cols-3'>
        {SECTIONS.map(section => (
          <Link
            key={section.slug}
            href={`/${section.slug}`}
            className='rounded-xl border border-gray-950/10 p-5 transition-colors hover:border-gray-950/20 hover:bg-gray-50 dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/5'
          >
            <span className='flex items-baseline justify-between'>
              <span className='font-medium text-gray-950 dark:text-white'>{section.title}</span>
              <span className='text-sm tabular-nums text-gray-400'>{manifest[section.slug]?.length ?? 0}</span>
            </span>
            <span className='mt-1 block text-sm text-gray-500 dark:text-gray-400'>{section.description}</span>
          </Link>
        ))}
      </div>

      {SECTIONS.map(section => (
        <section
          key={section.slug}
          className='mt-14'
        >
          <h2 className='heading-6 text-gray-950 dark:text-white'>{section.title}</h2>
          <ItemGrid
            section={section.slug}
            entries={manifest[section.slug] ?? []}
          />
        </section>
      ))}
    </div>
  );
}
