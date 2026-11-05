import { notFound } from 'next/navigation';

import { EmbedDemo } from '@/components/gallery/embed-demo';
import { COMPONENT_META, getComponentMeta } from '@/lib/components/meta';
type Params = {
  slug: string;
};
export const dynamicParams = false;
export function generateStaticParams(): Params[] {
  return COMPONENT_META.map(item => ({ slug: item.slug }));
}
export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  if (!getComponentMeta(slug)) {
    notFound();
  }
  return <EmbedDemo slug={slug} />;
}
