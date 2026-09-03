'use client';

import dynamic from 'next/dynamic';

import { getModule } from '@/lib/registry';

import { PlaygroundProvider } from './PlaygroundContext';
import { ViewSource } from './ViewSource';

// MDX docs keyed by `group` slug → `component` slug. Group-aware so identically-named
// entries (the headless `Dialog` primitive vs. the styled `Dialog` component) stay distinct.
const docModules: Record<string, Record<string, React.ComponentType>> = {
  'user-button': {
    'user-button': dynamic(() => import('../stories/user-button.mdx')),
  },
  'user-profile': {
    'user-page': dynamic(() => import('../stories/user-page.mdx')),
    'user-profile-profile-panel': dynamic(() => import('../stories/user-profile-profile-panel.mdx')),
    'user-profile-security-panel': dynamic(() => import('../stories/user-profile-security-panel.mdx')),
    'user-profile-billing-panel': dynamic(() => import('../stories/user-profile-billing-panel.mdx')),
    'user-profile-api-keys-panel': dynamic(() => import('../stories/user-profile-api-keys-panel.mdx')),
    'user-profile-account-section': dynamic(() => import('../stories/user-profile-account-section.mdx')),
    'user-profile-password-section': dynamic(() => import('../stories/user-profile-password-section.mdx')),
    'user-profile-passkeys-section': dynamic(() => import('../stories/user-profile-passkeys-section.mdx')),
    'user-profile-mfa-section': dynamic(() => import('../stories/user-profile-mfa-section.mdx')),
    'user-profile-active-devices-section': dynamic(() => import('../stories/user-profile-active-devices-section.mdx')),
    'user-profile-subscription-section': dynamic(() => import('../stories/user-profile-subscription-section.mdx')),
    'user-profile-payment-methods-section': dynamic(
      () => import('../stories/user-profile-payment-methods-section.mdx'),
    ),
    'user-profile-billing-history-section': dynamic(
      () => import('../stories/user-profile-billing-history-section.mdx'),
    ),
    'user-profile-connected-accounts-section': dynamic(
      () => import('../stories/user-profile-connected-accounts-section.mdx'),
    ),
    'user-profile-web3wallets-section': dynamic(() => import('../stories/user-profile-web3-wallets-section.mdx')),
    'user-profile-delete-section': dynamic(() => import('../stories/user-profile-delete-section.mdx')),
  },
  blocks: {
    destructive: dynamic(() => import('../stories/destructive.mdx')),
    reverification: dynamic(() => import('../stories/reverification.mdx')),
  },
  components: {
    avatar: dynamic(() => import('../stories/avatar.mdx')),
    badge: dynamic(() => import('../stories/badge.mdx')),
    banner: dynamic(() => import('../stories/banner.mdx')),
    button: dynamic(() => import('../stories/button.mdx')),
    card: dynamic(() => import('../stories/card.component.mdx')),
    combobox: dynamic(() => import('../stories/combobox.mdx')),
    input: dynamic(() => import('../stories/input.mdx')),
    'input-group': dynamic(() => import('../stories/input-group.mdx')),
    item: dynamic(() => import('../stories/item.mdx')),
    dialog: dynamic(() => import('../stories/dialog.component.mdx')),
    heading: dynamic(() => import('../stories/heading.mdx')),
    icon: dynamic(() => import('../stories/icon.mdx')),
    'icon-frame': dynamic(() => import('../stories/icon-frame.mdx')),
    menu: dynamic(() => import('../stories/menu.component.mdx')),
    otp: dynamic(() => import('../stories/otp.component.mdx')),
    popover: dynamic(() => import('../stories/popover.component.mdx')),
    section: dynamic(() => import('../stories/section.mdx')),
    text: dynamic(() => import('../stories/text.mdx')),
    field: dynamic(() => import('../stories/field.component.mdx')),
    flow: dynamic(() => import('../stories/flow.component.mdx')),
    'visually-hidden': dynamic(() => import('../stories/visually-hidden.mdx')),
  },
  primitives: {
    // Headless primitives — alphabetical.
    accordion: dynamic(() => import('../stories/accordion.mdx')),
    autocomplete: dynamic(() => import('../stories/autocomplete.mdx')),
    collapsible: dynamic(() => import('../stories/collapsible.mdx')),
    dialog: dynamic(() => import('../stories/dialog.mdx')),
    drawer: dynamic(() => import('../stories/drawer.mdx')),
    'file-upload': dynamic(() => import('../stories/file-upload.mdx')),
    flow: dynamic(() => import('../stories/flow.mdx')),
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
      <div className='text-muted-foreground p-3 text-sm sm:p-8'>
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
      <article
        className={`prose relative mx-auto w-full min-w-0 p-3 sm:p-8 ${meta?.layout === 'wide' ? 'max-w-7xl' : 'max-w-3xl'}`}
      >
        {meta?.source ? (
          <div className='absolute right-3 top-3 sm:right-8 sm:top-8'>
            <ViewSource source={meta.source} />
          </div>
        ) : null}
        <DocContent />
      </article>
    </PlaygroundProvider>
  );
}
