import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Example, PrevNext, PropsTable } from '@/components/docs';
import { getItem, getManifest, getOrderedEntries, getSection, SECTIONS, SOURCE_REPO, summarize } from '@/lib/content';
import { renderMDX } from '@/lib/mdx';

type Params = { params: Promise<{ section: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  const manifest = getManifest();
  return SECTIONS.flatMap(section =>
    (manifest[section.slug] ?? []).map(entry => ({ section: section.slug, slug: entry.slug })),
  );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { section, slug } = await params;
  const item = getItem(section, slug);
  if (!item) {
    return {};
  }
  return {
    title: `${item.title} | Mosaic | Clerk`,
    description: summarize(item.description),
    alternates: { canonical: `/${section}/${slug}` },
  };
}

export default async function MosaicItemPage({ params }: Params) {
  const { section: sectionSlug, slug } = await params;
  const item = getItem(sectionSlug, slug);
  const section = getSection(sectionSlug);
  if (!item || !section) {
    notFound();
  }

  const components = {
    Example: ({ id, name }: { id: string; name: string }) => (
      <Example
        name={name}
        code={item.examples[id]}
      />
    ),
    Props: () => <PropsTable props={item.props} />,
  };
  const [lede, body] = await Promise.all([
    item.description ? renderMDX(item.description) : null,
    renderMDX(item.body, components),
  ]);

  const ordered = getOrderedEntries();
  const index = ordered.findIndex(entry => entry.section === sectionSlug && entry.slug === slug);

  return (
    <article className='max-w-3xl'>
      <header className='mb-10'>
        <h1 className='heading-4 text-gray-950 dark:text-white'>{item.title}</h1>
        {item.source && (
          <a
            href={`${SOURCE_REPO}${item.source}`}
            className='mt-2 inline-block font-mono text-xs text-gray-500 hover:text-purple-600 dark:text-gray-400'
          >
            {item.source.replace(/^packages\//, '')}
          </a>
        )}
        {lede && <div className='prose-lede mt-4'>{lede}</div>}
      </header>
      <div className='prose-docs'>{body}</div>
      <PrevNext
        prev={ordered[index - 1]}
        next={ordered[index + 1]}
      />
    </article>
  );
}
