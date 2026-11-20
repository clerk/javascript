import { notFound } from 'next/navigation';

import { docEntries, findDoc } from '@/lib/docs';
import { docMarkdown } from '@/lib/llms-docs';

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

  return new Response(docMarkdown(entry), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
