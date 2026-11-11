import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CatalogGrid } from '@/components/catalog/catalog-views';
import { CATALOG, getCategory } from '@/lib/components/catalog';
type Params = { category: string };
export const dynamicParams = false;
export function generateStaticParams(): Params[] {
  return CATALOG.components.map(category => ({ category: category.id }));
}
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category } = await params;
  const found = getCategory('components', category);
  return found ? { title: `${found.label} · Components · Clerk UI` } : {};
}
export default async function Page({ params }: { params: Promise<Params> }) {
  const { category } = await params;
  if (!getCategory('components', category)) {
    notFound();
  }
  return (
    <CatalogGrid
      kind='components'
      categoryId={category}
    />
  );
}
