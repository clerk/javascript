// Import stories explicitly to control order and avoid type casting through unknown.
import { meta as accordionMeta } from '../stories/accordion.stories';
import {
  Default as AlertDialogDefault,
  DiscardChanges as AlertDialogDiscardChanges,
  meta as alertDialogComponentMeta,
} from '../stories/alert-dialog.component.stories';
import { meta as autocompleteMeta } from '../stories/autocomplete.stories';
import {
  Fallback as AvatarFallbackStory,
  Interactive as AvatarInteractive,
  meta as avatarMeta,
  Primary as AvatarPrimary,
  Shapes as AvatarShapes,
  Sizes as AvatarSizes,
} from '../stories/avatar.stories';
import {
  Colors as BadgeColors,
  meta as badgeMeta,
  Primary as BadgePrimary,
  WithIcon as BadgeWithIcon,
} from '../stories/badge.stories';
import { Disabled, meta as buttonMeta, Primary, Sizes } from '../stories/button.stories';
import {
  Centered as CardCentered,
  Default as CardDefault,
  meta as cardComponentMeta,
} from '../stories/card.component.stories';
import { meta as collapsibleMeta } from '../stories/collapsible.stories';
import { Default as DialogDefault, meta as dialogComponentMeta } from '../stories/dialog.component.stories';
import { meta as dialogMeta } from '../stories/dialog.stories';
import { meta as drawerMeta } from '../stories/drawer.stories';
import { Default as FieldDefault, meta as fieldMeta } from '../stories/field.component.stories';
import { meta as fileUploadMeta } from '../stories/file-upload.stories';
import {
  Colors as HeadingColors,
  Default as HeadingDefault,
  meta as headingMeta,
  Sizes as HeadingSizes,
} from '../stories/heading.stories';
import {
  Default as IconDefault,
  meta as iconMeta,
  Names as IconNames,
  Override as IconOverride,
  Sizes as IconSizes,
} from '../stories/icon.stories';
import {
  BrandIcons as IconFrameBrandIcons,
  CustomSurface as IconFrameCustomSurface,
  Default as IconFrameDefault,
  IconSizes as IconFrameIconSizes,
  meta as iconFrameMeta,
  MultipleTreatments as IconFrameMultipleTreatments,
} from '../stories/icon-frame.stories';
import {
  Default,
  Disabled as InputDisabled,
  Invalid,
  meta as inputMeta,
  Sizes as InputSizes,
} from '../stories/input.stories';
import {
  Default as ItemDefault,
  Group as ItemGroup,
  Interactive as ItemInteractive,
  meta as itemMeta,
  Scrolling as ItemScrolling,
} from '../stories/item.stories';
import { Default as MenuComponentDefault, meta as menuComponentMeta } from '../stories/menu.component.stories';
import { meta as menuMeta } from '../stories/menu.stories';
import { meta as otpMeta } from '../stories/otp.stories';
import {
  Alignment as PopoverComponentAlignment,
  Default as PopoverComponentDefault,
  meta as popoverComponentMeta,
  Placement as PopoverComponentPlacement,
} from '../stories/popover.component.stories';
import { meta as popoverMeta } from '../stories/popover.stories';
import {
  Default as ScrollAreaDefault,
  Gutter as ScrollAreaGutter,
  HoverReveal as ScrollAreaHoverReveal,
  meta as scrollAreaMeta,
  NotScrollable as ScrollAreaNotScrollable,
  ShadowIndicators as ScrollAreaShadowIndicators,
  ThemedScrollbar as ScrollAreaThemedScrollbar,
} from '../stories/scroll-area.stories';
import {
  ConnectedAccounts as SectionConnectedAccounts,
  Default as SectionDefault,
  Destructive as SectionDestructive,
  IconFrameMedia as SectionIconFrameMedia,
  meta as sectionMeta,
  MultipleEmailAndPhoneNumbers as SectionMultipleEmailAndPhoneNumbers,
} from '../stories/section.stories';
import { meta as selectMeta } from '../stories/select.stories';
import { meta as tabsMeta } from '../stories/tabs.stories';
import {
  Colors as TextColors,
  Default as TextDefault,
  meta as textMeta,
  Sizes as TextSizes,
} from '../stories/text.stories';
import { meta as tooltipMeta } from '../stories/tooltip.stories';
import { meta as useDataTableMeta } from '../stories/use-data-table.stories';
import {
  Combined as UserButtonCombined,
  meta as userButtonMeta,
  Organizations as UserButtonOrganizations,
  User as UserButtonUser,
} from '../stories/user-button.stories';
import {
  Default as UserProfileAccountSectionDefault,
  meta as userProfileAccountSectionMeta,
} from '../stories/user-profile-account-section.stories';
import {
  Default as UserProfileConnectedAccountsSectionDefault,
  meta as userProfileConnectedAccountsSectionMeta,
} from '../stories/user-profile-connected-accounts-section.stories';
import {
  Default as UserProfileDeleteSectionDefault,
  meta as userProfileDeleteSectionMeta,
} from '../stories/user-profile-delete-section.stories';
import {
  Default as UserProfileProfilePanelDefault,
  meta as userProfileProfilePanelMeta,
} from '../stories/user-profile-profile-panel.stories';
import {
  Default as UserProfileWeb3WalletsSectionDefault,
  meta as userProfileWeb3WalletsSectionMeta,
} from '../stories/user-profile-web3-wallets-section.stories';
import { toSlug } from './slug';
import type { StoryModule } from './types';

const sectionModule: StoryModule = {
  meta: sectionMeta,
  Default: SectionDefault,
  MultipleEmailAndPhoneNumbers: SectionMultipleEmailAndPhoneNumbers,
  ConnectedAccounts: SectionConnectedAccounts,
  IconFrameMedia: SectionIconFrameMedia,
  Destructive: SectionDestructive,
};
const dialogComponentModule: StoryModule = { meta: dialogComponentMeta, Default: DialogDefault };

const alertDialogComponentModule: StoryModule = {
  meta: alertDialogComponentMeta,
  Default: AlertDialogDefault,
  DiscardChanges: AlertDialogDiscardChanges,
};

const cardComponentModule: StoryModule = { meta: cardComponentMeta, Default: CardDefault, Centered: CardCentered };

const avatarModule: StoryModule = {
  meta: avatarMeta,
  Primary: AvatarPrimary,
  Interactive: AvatarInteractive,
  Fallback: AvatarFallbackStory,
  Sizes: AvatarSizes,
  Shapes: AvatarShapes,
};

const badgeModule: StoryModule = {
  meta: badgeMeta,
  Primary: BadgePrimary,
  Colors: BadgeColors,
  WithIcon: BadgeWithIcon,
};

const buttonModule: StoryModule = { meta: buttonMeta, Primary, Sizes, Disabled };

const inputModule: StoryModule = { meta: inputMeta, Default, Sizes: InputSizes, Disabled: InputDisabled, Invalid };

const popoverComponentModule: StoryModule = {
  meta: popoverComponentMeta,
  Default: PopoverComponentDefault,
  Placement: PopoverComponentPlacement,
  Alignment: PopoverComponentAlignment,
};

const itemModule: StoryModule = {
  meta: itemMeta,
  Default: ItemDefault,
  Interactive: ItemInteractive,
  Group: ItemGroup,
  Scrolling: ItemScrolling,
};

const userButtonModule: StoryModule = {
  meta: userButtonMeta,
  Combined: UserButtonCombined,
  Organizations: UserButtonOrganizations,
  User: UserButtonUser,
};

const headingModule: StoryModule = {
  meta: headingMeta,
  Default: HeadingDefault,
  Sizes: HeadingSizes,
  Colors: HeadingColors,
};

const menuComponentModule: StoryModule = { meta: menuComponentMeta, Default: MenuComponentDefault };

const textModule: StoryModule = { meta: textMeta, Default: TextDefault, Sizes: TextSizes, Colors: TextColors };

const fieldModule: StoryModule = {
  meta: fieldMeta,
  Default: FieldDefault,
};

const iconModule: StoryModule = {
  meta: iconMeta,
  Default: IconDefault,
  Sizes: IconSizes,
  Names: IconNames,
  Override: IconOverride,
};

const iconFrameModule: StoryModule = {
  meta: iconFrameMeta,
  Default: IconFrameDefault,
  IconSizes: IconFrameIconSizes,
  CustomSurface: IconFrameCustomSurface,
  MultipleTreatments: IconFrameMultipleTreatments,
  BrandIcons: IconFrameBrandIcons,
};

// Headless primitives carry just `meta` (no story functions). Like every component
// they're documented as a single overview page; their live demos come from `<Story>` /
// `<Preview>` embeds in the MDX, which import the stories module directly.
const accordionModule: StoryModule = { meta: accordionMeta };
const autocompleteModule: StoryModule = { meta: autocompleteMeta };
const collapsibleModule: StoryModule = { meta: collapsibleMeta };
const dialogModule: StoryModule = { meta: dialogMeta };
const drawerModule: StoryModule = { meta: drawerMeta };
const fileUploadModule: StoryModule = { meta: fileUploadMeta };
const menuModule: StoryModule = { meta: menuMeta };
const otpModule: StoryModule = { meta: otpMeta };
const popoverModule: StoryModule = { meta: popoverMeta };
const selectModule: StoryModule = { meta: selectMeta };
const tabsModule: StoryModule = { meta: tabsMeta };
const tooltipModule: StoryModule = { meta: tooltipMeta };

const scrollAreaModule: StoryModule = {
  meta: scrollAreaMeta,
  Default: ScrollAreaDefault,
  NotScrollable: ScrollAreaNotScrollable,
  Gutter: ScrollAreaGutter,
  HoverReveal: ScrollAreaHoverReveal,
  ThemedScrollbar: ScrollAreaThemedScrollbar,
  ShadowIndicators: ScrollAreaShadowIndicators,
};

const useDataTableModule: StoryModule = { meta: useDataTableMeta };

const userProfileAccountSectionModule: StoryModule = {
  meta: userProfileAccountSectionMeta,
  Default: UserProfileAccountSectionDefault,
};
const userProfileProfilePanelModule: StoryModule = {
  meta: userProfileProfilePanelMeta,
  Default: UserProfileProfilePanelDefault,
};
const userProfileConnectedAccountsSectionModule: StoryModule = {
  meta: userProfileConnectedAccountsSectionMeta,
  Default: UserProfileConnectedAccountsSectionDefault,
};
const userProfileWeb3WalletsSectionModule: StoryModule = {
  meta: userProfileWeb3WalletsSectionMeta,
  Default: UserProfileWeb3WalletsSectionDefault,
};
const userProfileDeleteSectionModule: StoryModule = {
  meta: userProfileDeleteSectionMeta,
  Default: UserProfileDeleteSectionDefault,
};

export const registry: StoryModule[] = [
  // User
  userButtonModule,
  userProfileProfilePanelModule,
  userProfileAccountSectionModule,
  userProfileConnectedAccountsSectionModule,
  userProfileWeb3WalletsSectionModule,
  userProfileDeleteSectionModule,
  // Components
  avatarModule,
  badgeModule,
  buttonModule,
  cardComponentModule,
  inputModule,
  itemModule,
  dialogComponentModule,
  alertDialogComponentModule,
  headingModule,
  iconModule,
  iconFrameModule,
  menuComponentModule,
  popoverComponentModule,
  sectionModule,
  textModule,
  fieldModule,
  // Primitives — alphabetical within the group.
  accordionModule,
  autocompleteModule,
  collapsibleModule,
  dialogModule,
  drawerModule,
  fileUploadModule,
  menuModule,
  otpModule,
  popoverModule,
  selectModule,
  tabsModule,
  tooltipModule,
  // Styles — atomic styles that ship as StyleX atoms rather than components.
  scrollAreaModule,
  // Hooks — alphabetical within the group.
  useDataTableModule,
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
