'use client';

import { getModule } from '@/lib/registry';

import AccordionDoc from '../stories/accordion.mdx';
import AutocompleteDoc from '../stories/autocomplete.mdx';
import ButtonDoc from '../stories/button.mdx';
import CollapsibleDoc from '../stories/collapsible.mdx';
import DeleteOrganizationDoc from '../stories/delete-organization.mdx';
import DestructiveDoc from '../stories/destructive.mdx';
import DialogComponentDoc from '../stories/dialog.component.mdx';
import DialogDoc from '../stories/dialog.mdx';
import InputDoc from '../stories/input.mdx';
import LeaveOrganizationDoc from '../stories/leave-organization.mdx';
import MenuDoc from '../stories/menu.mdx';
import OrganizationProfileDoc from '../stories/organization-profile.mdx';
import OrganizationProfileGeneralDoc from '../stories/organization-profile-general.mdx';
import PopoverDoc from '../stories/popover.mdx';
import SelectDoc from '../stories/select.mdx';
import TabsComponentDoc from '../stories/tabs.component.mdx';
import TabsDoc from '../stories/tabs.mdx';
import TooltipDoc from '../stories/tooltip.mdx';
import { PlaygroundProvider } from './PlaygroundContext';
import { ViewSource } from './ViewSource';

// MDX docs are imported statically (not via `next/dynamic`). A `next/dynamic` lazy boundary
// resolves differently on the server vs. the client, shifting React's `useId` tree-path and
// hydration-mismatching any `useId` component inside (Tabs, Dialog, …). Static imports render an
// identical tree on both sides, so `useId` stays stable and SSR is preserved.
//
// Keyed by `group` slug → `component` slug. Group-aware so identically-named entries (the headless
// `Dialog` primitive vs. the styled `Dialog` component) stay distinct.
const docModules: Record<string, Record<string, React.ComponentType>> = {
  aio: {
    'organization-profile': OrganizationProfileDoc,
  },
  panels: {
    'organization-profile-general': OrganizationProfileGeneralDoc,
  },
  sections: {
    'leave-organization': LeaveOrganizationDoc,
    'delete-organization': DeleteOrganizationDoc,
  },
  blocks: {
    destructive: DestructiveDoc,
  },
  components: {
    button: ButtonDoc,
    input: InputDoc,
    dialog: DialogComponentDoc,
    tabs: TabsComponentDoc,
  },
  primitives: {
    // Headless primitives — alphabetical.
    accordion: AccordionDoc,
    autocomplete: AutocompleteDoc,
    collapsible: CollapsibleDoc,
    dialog: DialogDoc,
    menu: MenuDoc,
    popover: PopoverDoc,
    select: SelectDoc,
    tabs: TabsDoc,
    tooltip: TooltipDoc,
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
