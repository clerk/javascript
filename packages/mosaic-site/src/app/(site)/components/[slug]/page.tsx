import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CatalogItemPage } from '@/components/catalog/catalog-views';
import { allItems, getItem } from '@/lib/components/catalog';
type Params = { slug: string };
export const dynamicParams = false;
export function generateStaticParams(): Params[] {
  return allItems('components').map(item => ({ slug: item.slug }));
}
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getItem('components', slug);
  return item ? { title: `${item.title} · Clerk UI` } : {};
}
export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  if (!getItem('components', slug)) {
    notFound();
  }
  return (
    <CatalogItemPage
      kind='components'
      slug={slug}
    />
  );
}
