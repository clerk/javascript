import type { Metadata } from 'next';

import { CatalogGrid } from '@/components/catalog/catalog-views';
export const metadata: Metadata = { title: 'Blocks · Clerk UI' };
export default function Page() {
  return <CatalogGrid kind='blocks' />;
}
