// Import stories explicitly to control order and avoid type casting through unknown.
import { Disabled, meta as buttonMeta, Primary, Sizes } from '../stories/button.stories';
import { meta as collapsibleMeta } from '../stories/collapsible.stories';
import { toSlug } from './slug';
import type { StoryModule } from './types';

const buttonModule: StoryModule = { meta: buttonMeta, Primary, Sizes, Disabled };

// Headless primitives are documented as overview-only: the registry entry carries
// just `meta` (no story functions), so the sidebar shows a single "Overview" link and
// no interactive knob canvas. The overview's live demos come from `<Story>` embeds in
// the MDX, which import the stories module directly (not through this registry).
const collapsibleModule: StoryModule = { meta: collapsibleMeta };

export const registry: StoryModule[] = [buttonModule, collapsibleModule];

export interface RegistryEntry {
  mod: StoryModule;
  storyName: string;
}

/** Find a story by component slug (from meta.title) and story slug (from export name). */
export function findStory(componentSlug: string, storySlug: string): RegistryEntry | null {
  for (const mod of registry) {
    if (toSlug(mod.meta.title) !== componentSlug) {
      continue;
    }
    for (const [exportName, value] of Object.entries(mod)) {
      if (exportName === 'meta') {
        continue;
      }
      if (typeof value !== 'function') {
        continue;
      }
      if (toSlug(exportName) === storySlug) {
        return { mod, storyName: exportName };
      }
    }
  }
  return null;
}

export function getStoryNames(mod: StoryModule): string[] {
  return Object.keys(mod).filter(k => k !== 'meta' && typeof mod[k] === 'function');
}

export function getSidebarGroups(): Array<{
  group: string;
  stories: Array<{ mod: StoryModule; componentSlug: string; names: string[] }>;
}> {
  const groupMap = new Map<string, Array<{ mod: StoryModule; componentSlug: string; names: string[] }>>();

  for (const mod of registry) {
    const { group, title } = mod.meta;
    if (!groupMap.has(group)) {
      groupMap.set(group, []);
    }
    const groupStories = groupMap.get(group);
    if (groupStories) {
      groupStories.push({
        mod,
        componentSlug: toSlug(title),
        names: getStoryNames(mod),
      });
    }
  }

  return Array.from(groupMap.entries()).map(([group, stories]) => ({ group, stories }));
}
