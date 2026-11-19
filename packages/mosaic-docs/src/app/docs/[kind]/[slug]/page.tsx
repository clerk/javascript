import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Preview } from '@/components/preview';
import { docTabs, overviewHeadings, overviewSections } from '@/core/doc-sections';
import { docEntries, docHref, findDoc, relatedHref } from '@/lib/docs';
import { DocContent } from '@/ui/doc-content';
import { DocTabList } from '@/ui/doc-tabs';
import { DocsPage } from '@/ui/docs-page';

export const dynamicParams = false;

export function generateStaticParams(): { kind: string; slug: string }[] {
  return docEntries.map(({ kind, slug }) => ({ kind, slug }));
}

export async function generateMetadata({ params }: PageProps<'/docs/[kind]/[slug]'>): Promise<Metadata> {
  const { kind, slug } = await params;
  const entry = findDoc(kind, slug);
  return entry
    ? {
        title: entry.doc.name,
        description: entry.doc.description,
        alternates: { types: { 'text/markdown': `${docHref(entry)}.md` } },
      }
    : {};
}

export default async function DocPage({ params }: PageProps<'/docs/[kind]/[slug]'>) {
  const { kind, slug } = await params;
  const entry = findDoc(kind, slug);
  if (!entry) {
    notFound();
  }

  const path = `${kind}/${slug}`;
  const href = docHref(entry);
  return (
    <DocsPage
      headings={overviewHeadings(entry.doc)}
      markdownHref={`${href}.md`}
    >
      <DocContent
        doc={entry.doc}
        sections={overviewSections(entry.doc)}
        intro={
          <>
            {docTabs(entry.doc) ? (
              <DocTabList
                href={href}
                selected='overview'
              />
            ) : null}
            <Preview path={path} />
          </>
        }
        hrefFor={relatedHref}
      />
    </DocsPage>
  );
}
