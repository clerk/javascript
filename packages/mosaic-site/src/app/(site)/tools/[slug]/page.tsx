import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ToolPage } from '@/components/marketing/tool-page';
import { getToolMeta, TOOL_META } from '@/lib/mosaic-tools/meta';
type Params = {
  slug: string;
};
const custom = ['brand', 'hero-cell-trail', 'hero-graphite-subtle', 'browser-frame'];
const generic = TOOL_META.filter(tool => !custom.includes(tool.slug));
export const dynamicParams = false;
export function generateStaticParams(): Params[] {
  return generic.map(tool => ({ slug: tool.slug }));
}
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const meta = getToolMeta(slug);
  return meta ? { title: `${meta.title} · Mosaic Lab`, description: meta.description } : {};
}
export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  if (!generic.some(tool => tool.slug === slug)) {
    notFound();
  }
  return <ToolPage slug={slug} />;
}
