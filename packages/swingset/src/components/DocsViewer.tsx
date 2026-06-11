'use client';

import dynamic from 'next/dynamic';

import { getModuleBySlug } from '@/lib/registry';

import { PlaygroundProvider } from './PlaygroundContext';
import { ViewSource } from './ViewSource';

const docModules: Record<string, React.ComponentType> = {
  button: dynamic(() => import('../stories/button.mdx')),
  input: dynamic(() => import('../stories/input.mdx')),
  // Headless primitives — alphabetical.
  accordion: dynamic(() => import('../stories/accordion.mdx')),
  autocomplete: dynamic(() => import('../stories/autocomplete.mdx')),
  collapsible: dynamic(() => import('../stories/collapsible.mdx')),
  dialog: dynamic(() => import('../stories/dialog.mdx')),
  menu: dynamic(() => import('../stories/menu.mdx')),
  popover: dynamic(() => import('../stories/popover.mdx')),
  select: dynamic(() => import('../stories/select.mdx')),
  tabs: dynamic(() => import('../stories/tabs.mdx')),
  tooltip: dynamic(() => import('../stories/tooltip.mdx')),
};

interface DocsViewerProps {
  slug: string;
}

export function DocsViewer({ slug }: DocsViewerProps) {
  const DocContent = docModules[slug];
  if (!DocContent) {
    return <div className='text-muted-foreground p-8 text-sm'>No docs found for &quot;{slug}&quot;.</div>;
  }
  const meta = getModuleBySlug(slug)?.meta;
  return (
    // Keyed by slug so navigating between components resets the playground state.
    <PlaygroundProvider
      key={slug}
      meta={meta}
    >
      <article className='prose relative mx-auto max-w-3xl p-8'>
        {meta?.source ? (
          <div className='absolute right-8 top-8'>
            <ViewSource source={meta.source} />
          </div>
        ) : null}
        <DocContent />
      </article>
    </PlaygroundProvider>
  );
}
