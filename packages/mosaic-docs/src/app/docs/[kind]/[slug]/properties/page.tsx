import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PlaygroundPreview } from '@/components/playground-preview';
import { docTabs } from '@/core/doc-sections';
import { docEntries, docHref, findDoc } from '@/lib/docs';
import { DocProperties } from '@/ui/doc-content';
import { DocTabList } from '@/ui/doc-tabs';
import { DocsArticle } from '@/ui/docs-page';

export const dynamicParams = false;

export function generateStaticParams(): { kind: string; slug: string }[] {
  return docEntries.filter(({ doc }) => docTabs(doc)).map(({ kind, slug }) => ({ kind, slug }));
}

export async function generateMetadata({ params }: PageProps<'/docs/[kind]/[slug]/properties'>): Promise<Metadata> {
  const { kind, slug } = await params;
  const entry = findDoc(kind, slug);
  return entry ? { title: `${entry.doc.name} properties`, description: entry.doc.description } : {};
}

export default async function DocPropertiesPage({ params }: PageProps<'/docs/[kind]/[slug]/properties'>) {
  const { kind, slug } = await params;
  const entry = findDoc(kind, slug);
  const tabs = entry && docTabs(entry.doc);
  if (!entry || !tabs) {
    notFound();
  }

  const href = docHref(entry);
  return (
    <DocsArticle>
      <DocProperties
        doc={entry.doc}
        intro={
          <DocTabList
            href={href}
            selected='properties'
          />
        }
        tabs={tabs}
        preview={<PlaygroundPreview />}
      />
    </DocsArticle>
  );
}
