'use client';

import dynamic from 'next/dynamic';

import { getModule } from '@/lib/registry';

import { PlaygroundProvider } from './PlaygroundContext';
import { ViewSource } from './ViewSource';

// MDX docs keyed by `group` slug → `component` slug. Group-aware so identically-named
// entries (the headless `Dialog` primitive vs. the styled `Dialog` component) stay distinct.
const docModules: Record<string, Record<string, React.ComponentType>> = {
  user: {
    'user-button': dynamic(() => import('../stories/user-button.mdx')),
    'user-profile-profile-panel': dynamic(() => import('../stories/user-profile-profile-panel.mdx')),
    'user-profile-security-panel': dynamic(() => import('../stories/user-profile-security-panel.mdx')),
    'user-profile-account-section': dynamic(() => import('../stories/user-profile-account-section.mdx')),
    'user-profile-password-section': dynamic(() => import('../stories/user-profile-password-section.mdx')),
    'user-profile-passkeys-section': dynamic(() => import('../stories/user-profile-passkeys-section.mdx')),
    'user-profile-mfa-section': dynamic(() => import('../stories/user-profile-mfa-section.mdx')),
    'user-profile-active-devices-section': dynamic(() => import('../stories/user-profile-active-devices-section.mdx')),
    'user-profile-connected-accounts-section': dynamic(
      () => import('../stories/user-profile-connected-accounts-section.mdx'),
    ),
    'user-profile-web3wallets-section': dynamic(() => import('../stories/user-profile-web3-wallets-section.mdx')),
    'user-profile-delete-section': dynamic(() => import('../stories/user-profile-delete-section.mdx')),
  },
  components: {
    avatar: dynamic(() => import('../stories/avatar.mdx')),
    badge: dynamic(() => import('../stories/badge.mdx')),
    button: dynamic(() => import('../stories/button.mdx')),
    card: dynamic(() => import('../stories/card.component.mdx')),
    input: dynamic(() => import('../stories/input.mdx')),
    item: dynamic(() => import('../stories/item.mdx')),
    dialog: dynamic(() => import('../stories/dialog.component.mdx')),
    'alert-dialog': dynamic(() => import('../stories/alert-dialog.component.mdx')),
    heading: dynamic(() => import('../stories/heading.mdx')),
    icon: dynamic(() => import('../stories/icon.mdx')),
    menu: dynamic(() => import('../stories/menu.component.mdx')),
    popover: dynamic(() => import('../stories/popover.component.mdx')),
    section: dynamic(() => import('../stories/section.mdx')),
    text: dynamic(() => import('../stories/text.mdx')),
    field: dynamic(() => import('../stories/field.component.mdx')),
  },
  primitives: {
    // Headless primitives — alphabetical.
    accordion: dynamic(() => import('../stories/accordion.mdx')),
    autocomplete: dynamic(() => import('../stories/autocomplete.mdx')),
    collapsible: dynamic(() => import('../stories/collapsible.mdx')),
    dialog: dynamic(() => import('../stories/dialog.mdx')),
    drawer: dynamic(() => import('../stories/drawer.mdx')),
    'file-upload': dynamic(() => import('../stories/file-upload.mdx')),
    menu: dynamic(() => import('../stories/menu.mdx')),
    otp: dynamic(() => import('../stories/otp.mdx')),
    popover: dynamic(() => import('../stories/popover.mdx')),
    select: dynamic(() => import('../stories/select.mdx')),
    tabs: dynamic(() => import('../stories/tabs.mdx')),
    tooltip: dynamic(() => import('../stories/tooltip.mdx')),
  },
  styles: {
    // Atomic styles — shipped as StyleX atoms rather than components.
    'scroll-area': dynamic(() => import('../stories/scroll-area.mdx')),
  },
  hooks: {
    // Headless hooks — alphabetical.
    'use-data-table': dynamic(() => import('../stories/use-data-table.mdx')),
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
