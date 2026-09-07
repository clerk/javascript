import { DocsViewer } from '@/components/DocsViewer';

interface Props {
  params: Promise<{ group: string; component: string }>;
}

export default async function ComponentPage({ params }: Props) {
  const { group, component } = await params;
  return (
    <DocsViewer
      group={group}
      slug={component}
    />
  );
}
