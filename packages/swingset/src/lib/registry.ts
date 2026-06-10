// Import stories explicitly to control order and avoid type casting through unknown.
import { Disabled, meta as buttonMeta, Primary, Sizes } from '../stories/button.stories';
import { meta as collapsibleMeta } from '../stories/collapsible.stories';
import {
  Default,
  Disabled as InputDisabled,
  Invalid,
  meta as inputMeta,
  Sizes as InputSizes,
} from '../stories/input.stories';
import { toSlug } from './slug';
import type { StoryModule } from './types';

const buttonModule: StoryModule = { meta: buttonMeta, Primary, Sizes, Disabled };

const inputModule: StoryModule = { meta: inputMeta, Default, Sizes: InputSizes, Disabled: InputDisabled, Invalid };

// Headless primitives carry just `meta` (no story functions). Like every component
// they're documented as a single overview page; their live demos come from `<Story>` /
// `<Preview>` embeds in the MDX, which import the stories module directly.
const collapsibleModule: StoryModule = { meta: collapsibleMeta };

export const registry: StoryModule[] = [buttonModule, inputModule, collapsibleModule];

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
