import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ItemGrid } from '@/components/docs';
import { getManifest, getSection, SECTIONS } from '@/lib/content';

type Params = { params: Promise<{ section: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return SECTIONS.map(section => ({ section: section.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const section = getSection((await params).section);
  return section ? { title: `${section.title} | Mosaic | Clerk`, description: section.description } : {};
}

export default async function MosaicSectionPage({ params }: Params) {
  const section = getSection((await params).section);
  if (!section) {
    notFound();
  }
  const entries = getManifest()[section.slug] ?? [];

  return (
    <div className='max-w-4xl'>
      <h1 className='heading-4 text-gray-950 dark:text-white'>{section.title}</h1>
      <p className='mt-3 text-base/7 text-gray-600 dark:text-gray-400'>{section.description}</p>
      <ItemGrid
        section={section.slug}
        entries={entries}
      />
    </div>
  );
}
