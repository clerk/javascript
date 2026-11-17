import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Preview } from '@/components/preview';
import { docEntries, docHref, findDoc, relatedHref } from '@/lib/docs';
import { CopyPageButton } from '@/ui/copy-page-button';
import { DocContent, docHeadings } from '@/ui/doc-content';
import { DocsArticle, DocsAside } from '@/ui/docs-page';
import { TableOfContents } from '@/ui/table-of-contents';

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

  return (
    <>
      <DocsArticle>
        <DocContent
          doc={entry.doc}
          preview={<Preview path={`${kind}/${slug}`} />}
          hrefFor={relatedHref}
        />
      </DocsArticle>
      <DocsAside>
        <TableOfContents headings={docHeadings(entry.doc)} />
        <CopyPageButton href={`${docHref(entry)}.md`} />
      </DocsAside>
    </>
  );
}
