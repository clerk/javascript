import { StoryCanvas } from '@/components/StoryCanvas';

interface Props {
  params: Promise<{ component: string; story: string }>;
}

export default async function StoryPage({ params }: Props) {
  const { component, story } = await params;
  return (
    <StoryCanvas
      componentSlug={component}
      storySlug={story}
    />
  );
}
