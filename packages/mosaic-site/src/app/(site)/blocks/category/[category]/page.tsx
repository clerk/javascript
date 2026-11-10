import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CatalogGrid } from '@/components/catalog/catalog-views';
import { CATALOG, getCategory } from '@/lib/components/catalog';
type Params = { category: string };
export const dynamicParams = false;
export function generateStaticParams(): Params[] {
  return CATALOG.blocks.map(category => ({ category: category.id }));
}
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category } = await params;
  const found = getCategory('blocks', category);
  return found ? { title: `${found.label} · Blocks · Clerk UI` } : {};
}
export default async function Page({ params }: { params: Promise<Params> }) {
  const { category } = await params;
  if (!getCategory('blocks', category)) {
    notFound();
  }
  return (
    <CatalogGrid
      kind='blocks'
      categoryId={category}
    />
  );
}
