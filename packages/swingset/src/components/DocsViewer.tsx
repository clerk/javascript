'use client';

import dynamic from 'next/dynamic';

const docModules: Record<string, React.ComponentType> = {
  button: dynamic(() => import('../stories/button.mdx')),
  input: dynamic(() => import('../stories/input.mdx')),
  collapsible: dynamic(() => import('../stories/collapsible.mdx')),
};

interface DocsViewerProps {
  slug: string;
}

export function DocsViewer({ slug }: DocsViewerProps) {
  const DocContent = docModules[slug];
  if (!DocContent) {
    return <div className='text-muted-foreground p-8 text-sm'>No docs found for &quot;{slug}&quot;.</div>;
  }
  return (
    <article className='prose mx-auto max-w-3xl p-8'>
      <DocContent />
    </article>
  );
}
