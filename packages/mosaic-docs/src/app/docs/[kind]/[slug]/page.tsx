import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { DocContent, docHeadings } from '@/components/doc-content';
import { DocsPage } from '@/components/docs-page';
import { docEntries, findDoc } from '@/lib/docs';

export const dynamicParams = false;

export function generateStaticParams(): { kind: string; slug: string }[] {
  return docEntries.map(({ kind, slug }) => ({ kind, slug }));
}

export async function generateMetadata({ params }: PageProps<'/docs/[kind]/[slug]'>): Promise<Metadata> {
  const { kind, slug } = await params;
  const entry = findDoc(kind, slug);
  return entry ? { title: entry.doc.name, description: entry.doc.description } : {};
}

export default async function DocPage({ params }: PageProps<'/docs/[kind]/[slug]'>) {
  const { kind, slug } = await params;
  const entry = findDoc(kind, slug);
  if (!entry) {
    notFound();
  }

  return (
    <DocsPage headings={docHeadings(entry.doc)}>
      <DocContent doc={entry.doc} />
    </DocsPage>
  );
}
