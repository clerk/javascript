import { DocsViewer } from '@/components/DocsViewer';

interface Props {
  params: Promise<{ component: string }>;
}

export default async function ComponentPage({ params }: Props) {
  const { component } = await params;
  return <DocsViewer slug={component} />;
}
