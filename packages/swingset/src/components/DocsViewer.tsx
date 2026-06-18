'use client';

import dynamic from 'next/dynamic';

import { getModule } from '@/lib/registry';

import { PlaygroundProvider } from './PlaygroundContext';
import { ViewSource } from './ViewSource';

// MDX docs keyed by `group` slug → `component` slug. Group-aware so identically-named
// entries (the headless `Dialog` primitive vs. the styled `Dialog` component) stay distinct.
const docModules: Record<string, Record<string, React.ComponentType>> = {
  aio: {
    'organization-profile': dynamic(() => import('../stories/organization-profile.mdx')),
  },
  panels: {
    'organization-profile-general': dynamic(() => import('../stories/organization-profile-general.mdx')),
  },
  sections: {
    'leave-organization': dynamic(() => import('../stories/leave-organization.mdx')),
    'delete-organization': dynamic(() => import('../stories/delete-organization.mdx')),
  },
  blocks: {
    destructive: dynamic(() => import('../stories/destructive.mdx')),
  },
  components: {
    button: dynamic(() => import('../stories/button.mdx')),
    input: dynamic(() => import('../stories/input.mdx')),
    dialog: dynamic(() => import('../stories/dialog.component.mdx')),
    heading: dynamic(() => import('../stories/heading.mdx')),
    icon: dynamic(() => import('../stories/icon.mdx')),
    tabs: dynamic(() => import('../stories/tabs.component.mdx')),
    text: dynamic(() => import('../stories/text.mdx')),
  },
  primitives: {
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
  },
};

interface DocsViewerProps {
  group: string;
  slug: string;
}

export function DocsViewer({ group, slug }: DocsViewerProps) {
  const DocContent = docModules[group]?.[slug];
  if (!DocContent) {
    return (
      <div className='text-muted-foreground p-8 text-sm'>
        No docs found for &quot;{group}/{slug}&quot;.
      </div>
    );
  }
  const meta = getModule(group, slug)?.meta;
  return (
    // Keyed by group/slug so navigating between components resets the playground state.
    <PlaygroundProvider
      key={`${group}/${slug}`}
      meta={meta}
    >
      <article className='prose relative mx-auto w-full min-w-0 max-w-3xl p-8'>
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
