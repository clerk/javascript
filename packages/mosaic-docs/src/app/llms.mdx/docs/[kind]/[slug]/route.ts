import { notFound } from 'next/navigation';

import { docToMarkdown } from '@/lib/doc-markdown';
import { docEntries, docHref, findDoc, findDocByName } from '@/lib/docs';

export const dynamicParams = false;

export function generateStaticParams(): { kind: string; slug: string }[] {
  return docEntries.map(({ kind, slug }) => ({ kind, slug }));
}

export async function GET(_request: Request, { params }: RouteContext<'/llms.mdx/docs/[kind]/[slug]'>) {
  const { kind, slug } = await params;
  const entry = findDoc(kind, slug);
  if (!entry) {
    notFound();
  }

  const markdown = docToMarkdown(entry.doc, name => {
    const related = findDocByName(name);
    return related ? docHref(related) : undefined;
  });
  return new Response(markdown, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
