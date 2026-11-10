import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CatalogItemPage } from '@/components/catalog/catalog-views';
import { PartDetail } from '@/components/catalog/part-detail';
import { ComponentDetail } from '@/components/gallery/detail';
import { availableParts, findPart } from '@/lib/components/catalog';
import { COMPONENT_META, getComponentMeta } from '@/lib/components/meta';
import { STORY_BLOCKS } from '@/lib/components/stories';
type Params = {
  slug: string;
};
export const dynamicParams = false;
export function generateStaticParams(): Params[] {
  return [
    ...COMPONENT_META.filter(item => !item.comingSoon && !STORY_BLOCKS[item.slug]).map(item => ({ slug: item.slug })),
    ...Object.keys(STORY_BLOCKS).map(slug => ({ slug })),
    ...availableParts().map(part => ({ slug: part.slug })),
  ];
}
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const part = findPart(slug);
  if (part) {
    return { title: `${part.item.title} · Clerk UI`, description: part.item.description };
  }
  const meta = getComponentMeta(slug);
  return meta ? { title: `${meta.title} · Clerk UI`, description: meta.description } : {};
}
export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  if (STORY_BLOCKS[slug]) {
    return (
      <CatalogItemPage
        kind='blocks'
        slug={slug}
      />
    );
  }
  const part = findPart(slug);
  if (part && !part.item.soon) {
    return <PartDetail slug={slug} />;
  }
  const meta = getComponentMeta(slug);
  if (!meta || meta.comingSoon) {
    notFound();
  }
  return <ComponentDetail slug={slug} />;
}
