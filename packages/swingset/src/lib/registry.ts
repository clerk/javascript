// Import stories explicitly to control order and avoid type casting through unknown.
import { Disabled, meta as buttonMeta, Primary, Sizes } from '../stories/button.stories';
import { meta as tooltipMeta, Options as TooltipOptions } from '../stories/tooltip.stories';
import { toSlug } from './slug';
import type { StoryModule } from './types';

const buttonModule: StoryModule = { meta: buttonMeta, Primary, Sizes, Disabled };
const tooltipModule: StoryModule = { meta: tooltipMeta, Options: TooltipOptions };

export const registry: StoryModule[] = [buttonModule, tooltipModule];

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
