// Import stories explicitly to control order and avoid type casting through unknown.
import { meta as accordionMeta } from '../stories/accordion.stories';
import { meta as autocompleteMeta } from '../stories/autocomplete.stories';
import { Disabled, meta as buttonMeta, Primary, Sizes } from '../stories/button.stories';
import { meta as collapsibleMeta } from '../stories/collapsible.stories';
import { meta as dialogMeta } from '../stories/dialog.stories';
import {
  Default,
  Disabled as InputDisabled,
  Invalid,
  meta as inputMeta,
  Sizes as InputSizes,
} from '../stories/input.stories';
import { meta as menuMeta } from '../stories/menu.stories';
import { meta as popoverMeta } from '../stories/popover.stories';
import { meta as selectMeta } from '../stories/select.stories';
import { meta as tabsMeta } from '../stories/tabs.stories';
import { meta as tooltipMeta } from '../stories/tooltip.stories';
import { toSlug } from './slug';
import type { StoryModule } from './types';

const buttonModule: StoryModule = { meta: buttonMeta, Primary, Sizes, Disabled };

const inputModule: StoryModule = { meta: inputMeta, Default, Sizes: InputSizes, Disabled: InputDisabled, Invalid };

// Headless primitives carry just `meta` (no story functions). Like every component
// they're documented as a single overview page; their live demos come from `<Story>` /
// `<Preview>` embeds in the MDX, which import the stories module directly.
const accordionModule: StoryModule = { meta: accordionMeta };
const autocompleteModule: StoryModule = { meta: autocompleteMeta };
const collapsibleModule: StoryModule = { meta: collapsibleMeta };
const dialogModule: StoryModule = { meta: dialogMeta };
const menuModule: StoryModule = { meta: menuMeta };
const popoverModule: StoryModule = { meta: popoverMeta };
const selectModule: StoryModule = { meta: selectMeta };
const tabsModule: StoryModule = { meta: tabsMeta };
const tooltipModule: StoryModule = { meta: tooltipMeta };

export const registry: StoryModule[] = [
  buttonModule,
  inputModule,
  // Primitives — alphabetical within the group.
  accordionModule,
  autocompleteModule,
  collapsibleModule,
  dialogModule,
  menuModule,
  popoverModule,
  selectModule,
  tabsModule,
  tooltipModule,
];

/** Look up a component's story module from its slug (derived from `meta.title`). */
export function getModuleBySlug(slug: string): StoryModule | undefined {
  return registry.find(mod => toSlug(mod.meta.title) === slug);
}

export function getSidebarGroups(): Array<{
  group: string;
  components: Array<{ mod: StoryModule; componentSlug: string }>;
}> {
  const groupMap = new Map<string, Array<{ mod: StoryModule; componentSlug: string }>>();

  for (const mod of registry) {
    const { group, title } = mod.meta;
    if (!groupMap.has(group)) {
      groupMap.set(group, []);
    }
    groupMap.get(group)?.push({ mod, componentSlug: toSlug(title) });
  }

  return Array.from(groupMap.entries()).map(([group, components]) => ({ group, components }));
}
