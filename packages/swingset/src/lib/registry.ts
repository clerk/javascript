// Import stories explicitly to control order and avoid type casting through unknown.
import { meta as accordionMeta } from '../stories/accordion.stories';
import { meta as autocompleteMeta } from '../stories/autocomplete.stories';
import { Disabled, meta as buttonMeta, Primary, Sizes } from '../stories/button.stories';
import { meta as collapsibleMeta } from '../stories/collapsible.stories';
import {
  Default as DeleteOrganizationDefault,
  meta as deleteOrganizationMeta,
} from '../stories/delete-organization.stories';
import { Default as DestructiveDefault, meta as destructiveMeta } from '../stories/destructive.stories';
import { Default as DialogDefault, meta as dialogComponentMeta } from '../stories/dialog.component.stories';
import { meta as dialogMeta } from '../stories/dialog.stories';
import {
  Default as HeadingDefault,
  Intents as HeadingIntents,
  meta as headingMeta,
  Sizes as HeadingSizes,
} from '../stories/heading.stories';
import {
  Default,
  Disabled as InputDisabled,
  Invalid,
  meta as inputMeta,
  Sizes as InputSizes,
} from '../stories/input.stories';
import {
  Default as LeaveOrganizationDefault,
  meta as leaveOrganizationMeta,
} from '../stories/leave-organization.stories';
import { meta as menuMeta } from '../stories/menu.stories';
import {
  Default as OrganizationProfileDefault,
  meta as organizationProfileMeta,
} from '../stories/organization-profile.stories';
import {
  Default as OrganizationProfileGeneralDefault,
  meta as organizationProfileGeneralMeta,
} from '../stories/organization-profile-general.stories';
import { meta as popoverMeta } from '../stories/popover.stories';
import { meta as selectMeta } from '../stories/select.stories';
import { Default as TabsComponentDefault, meta as tabsComponentMeta } from '../stories/tabs.component.stories';
import { meta as tabsMeta } from '../stories/tabs.stories';
import {
  Default as TextDefault,
  Intents as TextIntents,
  meta as textMeta,
  Sizes as TextSizes,
} from '../stories/text.stories';
import { meta as tooltipMeta } from '../stories/tooltip.stories';
import { toSlug } from './slug';
import type { StoryModule } from './types';

const destructiveModule: StoryModule = { meta: destructiveMeta, Default: DestructiveDefault };
const leaveOrganizationModule: StoryModule = { meta: leaveOrganizationMeta, Default: LeaveOrganizationDefault };
const deleteOrganizationModule: StoryModule = { meta: deleteOrganizationMeta, Default: DeleteOrganizationDefault };
const organizationProfileModule: StoryModule = { meta: organizationProfileMeta, Default: OrganizationProfileDefault };
const organizationProfileGeneralModule: StoryModule = {
  meta: organizationProfileGeneralMeta,
  Default: OrganizationProfileGeneralDefault,
};

const buttonModule: StoryModule = { meta: buttonMeta, Primary, Sizes, Disabled };

const inputModule: StoryModule = { meta: inputMeta, Default, Sizes: InputSizes, Disabled: InputDisabled, Invalid };

const dialogComponentModule: StoryModule = { meta: dialogComponentMeta, Default: DialogDefault };

const headingModule: StoryModule = {
  meta: headingMeta,
  Default: HeadingDefault,
  Sizes: HeadingSizes,
  Intents: HeadingIntents,
};

const tabsComponentModule: StoryModule = { meta: tabsComponentMeta, Default: TabsComponentDefault };

const textModule: StoryModule = { meta: textMeta, Default: TextDefault, Sizes: TextSizes, Intents: TextIntents };

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
  // AIO
  organizationProfileModule,
  // Panels
  organizationProfileGeneralModule,
  // Sections
  leaveOrganizationModule,
  deleteOrganizationModule,
  // Blocks
  destructiveModule,
  // Components
  buttonModule,
  inputModule,
  dialogComponentModule,
  headingModule,
  tabsComponentModule,
  textModule,
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

/**
 * Look up a component's story module by its group + component slug (both derived from `meta`).
 * Group-aware so identically-titled entries in different groups (e.g. the headless `Dialog`
 * primitive and the styled `Dialog` component) resolve to distinct pages.
 */
export function getModule(groupSlug: string, componentSlug: string): StoryModule | undefined {
  return registry.find(mod => toSlug(mod.meta.group) === groupSlug && toSlug(mod.meta.title) === componentSlug);
}

export function getSidebarGroups(): Array<{
  group: string;
  groupSlug: string;
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

  return Array.from(groupMap.entries()).map(([group, components]) => ({
    group,
    groupSlug: toSlug(group),
    components,
  }));
}
