import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ComponentDetail } from '@/components/gallery/detail';
import { DocsShell } from '@/components/marketing/docs-shell';
import { COMPONENT_META, getComponentMeta } from '@/lib/components/meta';
type Params = {
  slug: string;
};
export const dynamicParams = false;
export function generateStaticParams(): Params[] {
  return COMPONENT_META.filter(item => !item.comingSoon).map(item => ({ slug: item.slug }));
}
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const meta = getComponentMeta(slug);
  return meta ? { title: `${meta.title} · Mosaic Components`, description: meta.description } : {};
}
export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const meta = getComponentMeta(slug);
  if (!meta || meta.comingSoon) {
    notFound();
  }
  return (
    <DocsShell title={`Components / ${meta.title}`}>
      <ComponentDetail slug={slug} />
    </DocsShell>
  );
}
