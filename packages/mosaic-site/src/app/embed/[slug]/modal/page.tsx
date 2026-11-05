import { notFound } from 'next/navigation';

import { EmbedModal } from '@/components/gallery/embed-modal';
import { COMPONENT_META, getComponentMeta } from '@/lib/components/meta';
type Params = {
  slug: string;
};
export const dynamicParams = false;
export function generateStaticParams(): Params[] {
  return COMPONENT_META.filter(item => item.modal).map(item => ({ slug: item.slug }));
}
export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  if (!getComponentMeta(slug)?.modal) {
    notFound();
  }
  return <EmbedModal slug={slug} />;
}
