import type { Metadata } from 'next';

import { CatalogGrid } from '@/components/catalog/catalog-views';
export const metadata: Metadata = { title: 'Components · Clerk UI' };
export default function Page() {
  return <CatalogGrid kind='components' />;
}
