import { StudioPreview } from '@/studio/StudioPreview';

export default async function StudioPreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <StudioPreview slug={slug} />;
}
