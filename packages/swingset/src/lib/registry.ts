// Import stories explicitly to control order and avoid type casting through unknown.
import { meta as accordionMeta } from '../stories/accordion.stories';
import { Default as ActionBarDefault, meta as actionBarMeta } from '../stories/action-bar.stories';
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
import {
  Announced as BannerAnnounced,
  Colors as BannerColors,
  Default as BannerDefault,
  LabelOnly as BannerLabelOnly,
  meta as bannerMeta,
} from '../stories/banner.stories';
import { Disabled, meta as buttonMeta, Primary, Sizes } from '../stories/button.stories';
import { Default as CardDefault, meta as cardComponentMeta } from '../stories/card.component.stories';
import {
  Default as CheckboxDefault,
  meta as checkboxMeta,
  Sizes as CheckboxSizes,
  States as CheckboxStates,
} from '../stories/checkbox.stories';
import { meta as collapsibleMeta } from '../stories/collapsible.stories';
import { meta as comboboxPrimitiveMeta } from '../stories/combobox.primitive.stories';
import {
  Default as ComboboxDefault,
  meta as comboboxMeta,
  Scrolling as ComboboxScrolling,
} from '../stories/combobox.stories';
import {
  Default as ConfirmationDefault,
  meta as confirmationMeta,
  WithError as ConfirmationWithError,
} from '../stories/confirmation.stories';
import { Default as DataListDefault, meta as dataListMeta, Plain as DataListPlain } from '../stories/data-list.stories';
import {
  Default as DestructiveDefault,
  meta as destructiveMeta,
  WithError as DestructiveWithError,
} from '../stories/destructive.stories';
import { Default as DialogDefault, meta as dialogComponentMeta } from '../stories/dialog.component.stories';
import { meta as dialogMeta } from '../stories/dialog.stories';
import {
  Default as DrawerComponentDefault,
  InsideProfile as DrawerComponentInsideProfile,
  meta as drawerComponentMeta,
} from '../stories/drawer.component.stories';
import { meta as drawerMeta } from '../stories/drawer.stories';
import {
  Default as EmptyStateDefault,
  LabelOnly as EmptyStateLabelOnly,
  meta as emptyStateMeta,
  NoResults as EmptyStateNoResults,
} from '../stories/empty-state.stories';
import {
  Default as FieldDefault,
  meta as fieldMeta,
  VisuallyHiddenLabel as FieldVisuallyHiddenLabel,
} from '../stories/field.component.stories';
import { meta as fileUploadMeta } from '../stories/file-upload.stories';
import { Default as FlowDefault, meta as flowComponentMeta } from '../stories/flow.component.stories';
import { meta as flowMeta } from '../stories/flow.stories';
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
  meta as iconFrameMeta,
  Sizes as IconFrameSizes,
  Treatments as IconFrameTreatments,
} from '../stories/icon-frame.stories';
import {
  Default,
  Disabled as InputDisabled,
  Ghost as InputGhost,
  Invalid,
  meta as inputMeta,
  Sizes as InputSizes,
} from '../stories/input.stories';
import {
  Default as InputGroupDefault,
  Disabled as InputGroupDisabled,
  Invalid as InputGroupInvalid,
  meta as inputGroupMeta,
  Sizes as InputGroupSizes,
} from '../stories/input-group.stories';
import {
  Default as ItemDefault,
  Group as ItemGroup,
  Interactive as ItemInteractive,
  meta as itemMeta,
  Scrolling as ItemScrolling,
} from '../stories/item.stories';
import {
  Catalog as LocalizationCatalog,
  CatalogWithOverrides as LocalizationCatalogWithOverrides,
  Fallback as LocalizationFallback,
  Helpers as LocalizationHelpers,
  meta as localizationMeta,
  Overrides as LocalizationOverrides,
  PluralRules as LocalizationPluralRules,
} from '../stories/localization.stories';
import { Default as MenuComponentDefault, meta as menuComponentMeta } from '../stories/menu.component.stories';
import { meta as menuMeta } from '../stories/menu.stories';
import {
  Default as OrganizationProfileDefault,
  meta as organizationProfileMeta,
  Overlay as OrganizationProfileOverlay,
} from '../stories/organization-profile.stories';
import {
  Default as OrganizationProfileApiKeysPanelDefault,
  meta as organizationProfileApiKeysPanelMeta,
} from '../stories/organization-profile-api-keys-panel.stories';
import {
  Default as OrganizationProfileBillingPanelDefault,
  meta as organizationProfileBillingPanelMeta,
} from '../stories/organization-profile-billing-panel.stories';
import {
  Default as OrganizationProfileGeneralPanelDefault,
  meta as organizationProfileGeneralPanelMeta,
} from '../stories/organization-profile-general-panel.stories';
import {
  Default as OrganizationProfileInvitationsTabDefault,
  meta as organizationProfileInvitationsTabMeta,
} from '../stories/organization-profile-invitations-tab.stories';
import {
  Default as OrganizationProfileMembersPanelDefault,
  EmptyInvitations as OrganizationProfileMembersPanelEmptyInvitations,
  EmptyMembers as OrganizationProfileMembersPanelEmptyMembers,
  EmptyRequests as OrganizationProfileMembersPanelEmptyRequests,
  meta as organizationProfileMembersPanelMeta,
} from '../stories/organization-profile-members-panel.stories';
import {
  Default as OrganizationProfileRequestsTabDefault,
  meta as organizationProfileRequestsTabMeta,
} from '../stories/organization-profile-requests-tab.stories';
import {
  Default as OrganizationProfileSecurityPanelDefault,
  meta as organizationProfileSecurityPanelMeta,
} from '../stories/organization-profile-security-panel.stories';
import {
  Default as OtpComponentDefault,
  Disabled as OtpComponentDisabled,
  Error as OtpComponentError,
  meta as otpComponentMeta,
  Success as OtpComponentSuccess,
} from '../stories/otp.component.stories';
import { meta as otpMeta } from '../stories/otp.stories';
import {
  Disabled as PaginationDisabled,
  FirstLast as PaginationFirstLast,
  meta as paginationMeta,
  MiddlePage as PaginationMiddlePage,
  Primary as PaginationPrimary,
  SinglePage as PaginationSinglePage,
} from '../stories/pagination.stories';
import {
  Default as PhoneInputDefault,
  Disabled as PhoneInputDisabled,
  Invalid as PhoneInputInvalid,
  meta as phoneInputMeta,
  Prefilled as PhoneInputPrefilled,
  Sizes as PhoneInputSizes,
} from '../stories/phone-input.stories';
import {
  Alignment as PopoverComponentAlignment,
  Default as PopoverComponentDefault,
  meta as popoverComponentMeta,
  Placement as PopoverComponentPlacement,
} from '../stories/popover.component.stories';
import { meta as popoverMeta } from '../stories/popover.stories';
import {
  Customized as ProfileCustomized,
  Default as ProfileDefault,
  meta as profileComponentMeta,
  Transitions as ProfileTransitions,
} from '../stories/profile.component.stories';
import {
  AuthenticatorOTP as ReverificationAuthenticatorOTP,
  BackupCode as ReverificationBackupCode,
  BackupCodeError as ReverificationBackupCodeError,
  BackupCodePending as ReverificationBackupCodePending,
  Default as ReverificationDefault,
  Help as ReverificationHelp,
  meta as reverificationMeta,
  MethodPicker as ReverificationMethodPicker,
  MethodPickerPending as ReverificationMethodPickerPending,
  OTP as ReverificationOTP,
  OTPError as ReverificationOTPError,
  OTPPending as ReverificationOTPPending,
  OTPResending as ReverificationOTPResending,
  Passkey as ReverificationPasskey,
  PasskeyError as ReverificationPasskeyError,
  PasskeyPending as ReverificationPasskeyPending,
  Password as ReverificationPassword,
  PasswordError as ReverificationPasswordError,
  PasswordPending as ReverificationPasswordPending,
} from '../stories/reverification.stories';
import {
  Default as ScrollAreaDefault,
  Gutter as ScrollAreaGutter,
  Horizontal as ScrollAreaHorizontal,
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
import {
  Controlled as SelectComponentControlled,
  Default as SelectComponentDefault,
  Descriptions as SelectComponentDescriptions,
  Ghost as SelectComponentGhost,
  meta as selectComponentMeta,
  Overflowing as SelectComponentOverflowing,
  Placeholder as SelectComponentPlaceholder,
} from '../stories/select.component.stories';
import { meta as selectMeta } from '../stories/select.stories';
import {
  Default as TableDefault,
  Empty as TableEmpty,
  meta as tableMeta,
  Overflow as TableOverflow,
  Selection as TableSelection,
  Sorting as TableSorting,
} from '../stories/table.stories';
import { Default as TabsComponentDefault, meta as tabsComponentMeta } from '../stories/tabs.component.stories';
import { meta as tabsMeta } from '../stories/tabs.stories';
import {
  Colors as TextColors,
  Default as TextDefault,
  meta as textMeta,
  Sizes as TextSizes,
} from '../stories/text.stories';
import { meta as toastPrimitiveMeta } from '../stories/toast.primitive.stories';
import { meta as toastMeta } from '../stories/toast.stories';
import {
  Default as TooltipComponentDefault,
  Group as TooltipComponentGroup,
  meta as tooltipComponentMeta,
  Placement as TooltipComponentPlacement,
} from '../stories/tooltip.component.stories';
import { meta as tooltipMeta } from '../stories/tooltip.stories';
import { meta as useDataTableMeta } from '../stories/use-data-table.stories';
import {
  Combined as UserButtonCombined,
  meta as userButtonMeta,
  Organizations as UserButtonOrganizations,
  User as UserButtonUser,
} from '../stories/user-button.stories';
import {
  Default as UserProfileDefault,
  meta as userProfileMeta,
  Overlay as UserProfileOverlay,
} from '../stories/user-profile.stories';
import {
  AddEmailFails as UserProfileAccountSectionAddEmailFails,
  AddPhoneFails as UserProfileAccountSectionAddPhoneFails,
  Default as UserProfileAccountSectionDefault,
  EmailLinkResendFails as UserProfileAccountSectionEmailLinkResendFails,
  EmailLinkVerification as UserProfileAccountSectionEmailLinkVerification,
  EmailRemovalError as UserProfileAccountSectionEmailRemovalError,
  EmailRemovalPending as UserProfileAccountSectionEmailRemovalPending,
  EmailSsoConnectFails as UserProfileAccountSectionEmailSsoConnectFails,
  EmailSsoVerification as UserProfileAccountSectionEmailSsoVerification,
  meta as userProfileAccountSectionMeta,
  MultipleAccounts as UserProfileAccountSectionMultipleAccounts,
  PhoneRemovalError as UserProfileAccountSectionPhoneRemovalError,
  PhoneRemovalPending as UserProfileAccountSectionPhoneRemovalPending,
} from '../stories/user-profile-account-section.stories';
import {
  Default as UserProfileActiveDevicesSectionDefault,
  Impersonation as UserProfileActiveDevicesSectionImpersonation,
  meta as userProfileActiveDevicesSectionMeta,
  SignOutError as UserProfileActiveDevicesSectionSignOutError,
} from '../stories/user-profile-active-devices-section.stories';
import {
  Default as UserProfileApiKeysPanelDefault,
  Empty as UserProfileApiKeysPanelEmpty,
  meta as userProfileApiKeysPanelMeta,
} from '../stories/user-profile-api-keys-panel.stories';
import {
  Default as UserProfileBillingHistorySectionDefault,
  Empty as UserProfileBillingHistorySectionEmpty,
  meta as userProfileBillingHistorySectionMeta,
} from '../stories/user-profile-billing-history-section.stories';
import {
  Default as UserProfileBillingPanelDefault,
  meta as userProfileBillingPanelMeta,
} from '../stories/user-profile-billing-panel.stories';
import {
  ConnectionError as ConnectedAccountsConnectionError,
  ConnectOnly as ConnectedAccountsConnectOnly,
  Default as UserProfileConnectedAccountsSectionDefault,
  LinkedAccounts as ConnectedAccountsLinkedAccounts,
  meta as userProfileConnectedAccountsSectionMeta,
  ReconnectRequired as ConnectedAccountsReconnectRequired,
  RemovalError as ConnectedAccountsRemovalError,
  RemovalPending as ConnectedAccountsRemovalPending,
  VerificationError as ConnectedAccountsVerificationError,
} from '../stories/user-profile-connected-accounts-section.stories';
import {
  Default as UserProfileDeleteSectionDefault,
  meta as userProfileDeleteSectionMeta,
  WithError as UserProfileDeleteSectionWithError,
} from '../stories/user-profile-delete-section.stories';
import {
  ConnectionError as UserProfileEnterpriseAccountsSectionConnectionError,
  ConnectOnly as UserProfileEnterpriseAccountsSectionConnectOnly,
  Default as UserProfileEnterpriseAccountsSectionDefault,
  LinkedAccounts as UserProfileEnterpriseAccountsSectionLinkedAccounts,
  meta as userProfileEnterpriseAccountsSectionMeta,
  RequiresAction as UserProfileEnterpriseAccountsSectionRequiresAction,
} from '../stories/user-profile-enterprise-accounts-section.stories';
import {
  Default as UserProfileMfaSectionDefault,
  meta as userProfileMfaSectionMeta,
} from '../stories/user-profile-mfa-section.stories';
import {
  CreationUnavailable as UserProfilePasskeysSectionCreationUnavailable,
  Default as UserProfilePasskeysSectionDefault,
  Empty as UserProfilePasskeysSectionEmpty,
  meta as userProfilePasskeysSectionMeta,
  RecoverableErrors as UserProfilePasskeysSectionRecoverableErrors,
} from '../stories/user-profile-passkeys-section.stories';
import {
  Default as UserProfilePasswordSectionDefault,
  EditPasswordFails as UserProfilePasswordSectionEditPasswordFails,
  ManagedByEnterprise as UserProfilePasswordSectionManagedByEnterprise,
  meta as userProfilePasswordSectionMeta,
  SetPassword as UserProfilePasswordSectionSetPassword,
  WithoutCurrentPassword as UserProfilePasswordSectionWithoutCurrentPassword,
} from '../stories/user-profile-password-section.stories';
import {
  Default as UserProfilePaymentMethodsSectionDefault,
  Empty as UserProfilePaymentMethodsSectionEmpty,
  meta as userProfilePaymentMethodsSectionMeta,
} from '../stories/user-profile-payment-methods-section.stories';
import {
  Default as UserProfileProfilePanelDefault,
  meta as userProfileProfilePanelMeta,
} from '../stories/user-profile-profile-panel.stories';
import {
  Default as UserProfileSecurityPanelDefault,
  meta as userProfileSecurityPanelMeta,
} from '../stories/user-profile-security-panel.stories';
import {
  Default as UserProfileSubscriptionSectionDefault,
  meta as userProfileSubscriptionSectionMeta,
} from '../stories/user-profile-subscription-section.stories';
import {
  ConnectedWallets as UserProfileWeb3WalletsSectionConnectedWallets,
  ConnectionError as UserProfileWeb3WalletsSectionConnectionError,
  ConnectOnly as UserProfileWeb3WalletsSectionConnectOnly,
  Default as UserProfileWeb3WalletsSectionDefault,
  meta as userProfileWeb3WalletsSectionMeta,
  PrimaryError as UserProfileWeb3WalletsSectionPrimaryError,
  RemovalError as UserProfileWeb3WalletsSectionRemovalError,
  RemovalPending as UserProfileWeb3WalletsSectionRemovalPending,
  UnverifiedWallet as UserProfileWeb3WalletsSectionUnverifiedWallet,
} from '../stories/user-profile-web3-wallets-section.stories';
import {
  Default as VisuallyHiddenDefault,
  LiveRegion as VisuallyHiddenLiveRegion,
  meta as visuallyHiddenMeta,
} from '../stories/visually-hidden.stories';
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
const drawerComponentModule: StoryModule = {
  meta: drawerComponentMeta,
  Default: DrawerComponentDefault,
  InsideProfile: DrawerComponentInsideProfile,
};

const cardComponentModule: StoryModule = { meta: cardComponentMeta, Default: CardDefault };

const checkboxModule: StoryModule = {
  meta: checkboxMeta,
  Default: CheckboxDefault,
  States: CheckboxStates,
  Sizes: CheckboxSizes,
};

const emptyStateModule: StoryModule = {
  meta: emptyStateMeta,
  Default: EmptyStateDefault,
  NoResults: EmptyStateNoResults,
  LabelOnly: EmptyStateLabelOnly,
};

const comboboxModule: StoryModule = {
  meta: comboboxMeta,
  Default: ComboboxDefault,
  Scrolling: ComboboxScrolling,
};

const actionBarModule: StoryModule = {
  meta: actionBarMeta,
  Default: ActionBarDefault,
};

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

const bannerModule: StoryModule = {
  meta: bannerMeta,
  Default: BannerDefault,
  Colors: BannerColors,
  LabelOnly: BannerLabelOnly,
  Announced: BannerAnnounced,
};

const buttonModule: StoryModule = { meta: buttonMeta, Primary, Sizes, Disabled };

const inputModule: StoryModule = {
  meta: inputMeta,
  Default,
  Sizes: InputSizes,
  Disabled: InputDisabled,
  Invalid,
  Ghost: InputGhost,
};

const inputGroupModule: StoryModule = {
  meta: inputGroupMeta,
  Default: InputGroupDefault,
  Sizes: InputGroupSizes,
  Disabled: InputGroupDisabled,
  Invalid: InputGroupInvalid,
};

const paginationModule: StoryModule = {
  meta: paginationMeta,
  Primary: PaginationPrimary,
  FirstLast: PaginationFirstLast,
  MiddlePage: PaginationMiddlePage,
  SinglePage: PaginationSinglePage,
  Disabled: PaginationDisabled,
};

const phoneInputModule: StoryModule = {
  meta: phoneInputMeta,
  Default: PhoneInputDefault,
  Sizes: PhoneInputSizes,
  Prefilled: PhoneInputPrefilled,
  Disabled: PhoneInputDisabled,
  Invalid: PhoneInputInvalid,
};

const popoverComponentModule: StoryModule = {
  meta: popoverComponentMeta,
  Default: PopoverComponentDefault,
  Placement: PopoverComponentPlacement,
  Alignment: PopoverComponentAlignment,
};
const profileComponentModule: StoryModule = {
  meta: profileComponentMeta,
  Default: ProfileDefault,
  Customized: ProfileCustomized,
  Transitions: ProfileTransitions,
};

const dataListModule: StoryModule = {
  meta: dataListMeta,
  Default: DataListDefault,
  Plain: DataListPlain,
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

const selectComponentModule: StoryModule = {
  meta: selectComponentMeta,
  Default: SelectComponentDefault,
  Descriptions: SelectComponentDescriptions,
  Ghost: SelectComponentGhost,
  Placeholder: SelectComponentPlaceholder,
  Controlled: SelectComponentControlled,
  Overflowing: SelectComponentOverflowing,
};

const otpComponentModule: StoryModule = {
  meta: otpComponentMeta,
  Default: OtpComponentDefault,
  Success: OtpComponentSuccess,
  Error: OtpComponentError,
  Disabled: OtpComponentDisabled,
};

const textModule: StoryModule = { meta: textMeta, Default: TextDefault, Sizes: TextSizes, Colors: TextColors };

const tooltipComponentModule: StoryModule = {
  meta: tooltipComponentMeta,
  Default: TooltipComponentDefault,
  Placement: TooltipComponentPlacement,
  Group: TooltipComponentGroup,
};

const fieldModule: StoryModule = {
  meta: fieldMeta,
  Default: FieldDefault,
  VisuallyHiddenLabel: FieldVisuallyHiddenLabel,
};

const visuallyHiddenModule: StoryModule = {
  meta: visuallyHiddenMeta,
  Default: VisuallyHiddenDefault,
  LiveRegion: VisuallyHiddenLiveRegion,
};

const flowComponentModule: StoryModule = {
  meta: flowComponentMeta,
  Default: FlowDefault,
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
  Sizes: IconFrameSizes,
  Treatments: IconFrameTreatments,
  CustomSurface: IconFrameCustomSurface,
  BrandIcons: IconFrameBrandIcons,
};

// Headless primitives carry just `meta` (no story functions). Like every component
// they're documented as a single overview page; their live demos come from `<Story>` /
// `<Preview>` embeds in the MDX, which import the stories module directly.
const accordionModule: StoryModule = { meta: accordionMeta };
const autocompleteModule: StoryModule = { meta: autocompleteMeta };
const comboboxPrimitiveModule: StoryModule = { meta: comboboxPrimitiveMeta };
const collapsibleModule: StoryModule = { meta: collapsibleMeta };
const dialogModule: StoryModule = { meta: dialogMeta };
const drawerModule: StoryModule = { meta: drawerMeta };
const fileUploadModule: StoryModule = { meta: fileUploadMeta };
const flowModule: StoryModule = { meta: flowMeta };
const menuModule: StoryModule = { meta: menuMeta };
const otpModule: StoryModule = { meta: otpMeta };
const popoverModule: StoryModule = { meta: popoverMeta };
const selectModule: StoryModule = { meta: selectMeta };
const tabsModule: StoryModule = { meta: tabsMeta };
const toastPrimitiveModule: StoryModule = { meta: toastPrimitiveMeta };
const tooltipModule: StoryModule = { meta: tooltipMeta };

const scrollAreaModule: StoryModule = {
  meta: scrollAreaMeta,
  Default: ScrollAreaDefault,
  NotScrollable: ScrollAreaNotScrollable,
  Gutter: ScrollAreaGutter,
  Horizontal: ScrollAreaHorizontal,
  HoverReveal: ScrollAreaHoverReveal,
  ThemedScrollbar: ScrollAreaThemedScrollbar,
  ShadowIndicators: ScrollAreaShadowIndicators,
};

const useDataTableModule: StoryModule = { meta: useDataTableMeta };

const localizationModule: StoryModule = {
  meta: localizationMeta,
  Overrides: LocalizationOverrides,
  Catalog: LocalizationCatalog,
  CatalogWithOverrides: LocalizationCatalogWithOverrides,
  Helpers: LocalizationHelpers,
  Fallback: LocalizationFallback,
  PluralRules: LocalizationPluralRules,
};

const tableModule: StoryModule = {
  meta: tableMeta,
  Default: TableDefault,
  Sorting: TableSorting,
  Selection: TableSelection,
  Empty: TableEmpty,
  Overflow: TableOverflow,
};

const tabsComponentModule: StoryModule = {
  meta: tabsComponentMeta,
  Default: TabsComponentDefault,
};

// Planned but not yet implemented; the entry reserves its sidebar slot with a todo dot.
const toastModule: StoryModule = { meta: toastMeta };

const userProfileApiKeysPanelModule: StoryModule = {
  meta: userProfileApiKeysPanelMeta,
  Default: UserProfileApiKeysPanelDefault,
  Empty: UserProfileApiKeysPanelEmpty,
};
const organizationProfileModule: StoryModule = {
  meta: organizationProfileMeta,
  Default: OrganizationProfileDefault,
  Overlay: OrganizationProfileOverlay,
};
const organizationProfileGeneralPanelModule: StoryModule = {
  meta: organizationProfileGeneralPanelMeta,
  Default: OrganizationProfileGeneralPanelDefault,
};
const organizationProfileMembersPanelModule: StoryModule = {
  meta: organizationProfileMembersPanelMeta,
  Default: OrganizationProfileMembersPanelDefault,
  EmptyMembers: OrganizationProfileMembersPanelEmptyMembers,
  EmptyInvitations: OrganizationProfileMembersPanelEmptyInvitations,
  EmptyRequests: OrganizationProfileMembersPanelEmptyRequests,
};
const organizationProfileSecurityPanelModule: StoryModule = {
  meta: organizationProfileSecurityPanelMeta,
  Default: OrganizationProfileSecurityPanelDefault,
};
const organizationProfileBillingPanelModule: StoryModule = {
  meta: organizationProfileBillingPanelMeta,
  Default: OrganizationProfileBillingPanelDefault,
};
const organizationProfileApiKeysPanelModule: StoryModule = {
  meta: organizationProfileApiKeysPanelMeta,
  Default: OrganizationProfileApiKeysPanelDefault,
};
const organizationProfileInvitationsTabModule: StoryModule = {
  meta: organizationProfileInvitationsTabMeta,
  Default: OrganizationProfileInvitationsTabDefault,
};
const organizationProfileRequestsTabModule: StoryModule = {
  meta: organizationProfileRequestsTabMeta,
  Default: OrganizationProfileRequestsTabDefault,
};
const userProfileModule: StoryModule = {
  meta: userProfileMeta,
  Default: UserProfileDefault,
  Overlay: UserProfileOverlay,
};

const userProfileAccountSectionModule: StoryModule = {
  meta: userProfileAccountSectionMeta,
  Default: UserProfileAccountSectionDefault,
  MultipleAccounts: UserProfileAccountSectionMultipleAccounts,
  AddPhoneFails: UserProfileAccountSectionAddPhoneFails,
  AddEmailFails: UserProfileAccountSectionAddEmailFails,
  EmailLinkVerification: UserProfileAccountSectionEmailLinkVerification,
  EmailLinkResendFails: UserProfileAccountSectionEmailLinkResendFails,
  EmailSsoVerification: UserProfileAccountSectionEmailSsoVerification,
  EmailSsoConnectFails: UserProfileAccountSectionEmailSsoConnectFails,
  EmailRemovalPending: UserProfileAccountSectionEmailRemovalPending,
  EmailRemovalError: UserProfileAccountSectionEmailRemovalError,
  PhoneRemovalPending: UserProfileAccountSectionPhoneRemovalPending,
  PhoneRemovalError: UserProfileAccountSectionPhoneRemovalError,
};
const userProfileProfilePanelModule: StoryModule = {
  meta: userProfileProfilePanelMeta,
  Default: UserProfileProfilePanelDefault,
};
const userProfileSecurityPanelModule: StoryModule = {
  meta: userProfileSecurityPanelMeta,
  Default: UserProfileSecurityPanelDefault,
};
const userProfileBillingPanelModule: StoryModule = {
  meta: userProfileBillingPanelMeta,
  Default: UserProfileBillingPanelDefault,
};
const userProfileBillingHistorySectionModule: StoryModule = {
  meta: userProfileBillingHistorySectionMeta,
  Default: UserProfileBillingHistorySectionDefault,
  Empty: UserProfileBillingHistorySectionEmpty,
};
const userProfilePasswordSectionModule: StoryModule = {
  meta: userProfilePasswordSectionMeta,
  Default: UserProfilePasswordSectionDefault,
  SetPassword: UserProfilePasswordSectionSetPassword,
  WithoutCurrentPassword: UserProfilePasswordSectionWithoutCurrentPassword,
  ManagedByEnterprise: UserProfilePasswordSectionManagedByEnterprise,
  EditPasswordFails: UserProfilePasswordSectionEditPasswordFails,
};
const userProfilePasskeysSectionModule: StoryModule = {
  meta: userProfilePasskeysSectionMeta,
  CreationUnavailable: UserProfilePasskeysSectionCreationUnavailable,
  Default: UserProfilePasskeysSectionDefault,
  Empty: UserProfilePasskeysSectionEmpty,
  RecoverableErrors: UserProfilePasskeysSectionRecoverableErrors,
};
const userProfileMfaSectionModule: StoryModule = {
  meta: userProfileMfaSectionMeta,
  Default: UserProfileMfaSectionDefault,
};
const userProfileActiveDevicesSectionModule: StoryModule = {
  meta: userProfileActiveDevicesSectionMeta,
  Default: UserProfileActiveDevicesSectionDefault,
  SignOutError: UserProfileActiveDevicesSectionSignOutError,
  Impersonation: UserProfileActiveDevicesSectionImpersonation,
};
const userProfileSubscriptionSectionModule: StoryModule = {
  meta: userProfileSubscriptionSectionMeta,
  Default: UserProfileSubscriptionSectionDefault,
};
const userProfilePaymentMethodsSectionModule: StoryModule = {
  meta: userProfilePaymentMethodsSectionMeta,
  Default: UserProfilePaymentMethodsSectionDefault,
  Empty: UserProfilePaymentMethodsSectionEmpty,
};
const userProfileEnterpriseAccountsSectionModule: StoryModule = {
  meta: userProfileEnterpriseAccountsSectionMeta,
  Default: UserProfileEnterpriseAccountsSectionDefault,
  LinkedAccounts: UserProfileEnterpriseAccountsSectionLinkedAccounts,
  RequiresAction: UserProfileEnterpriseAccountsSectionRequiresAction,
  ConnectOnly: UserProfileEnterpriseAccountsSectionConnectOnly,
  ConnectionError: UserProfileEnterpriseAccountsSectionConnectionError,
};
const userProfileConnectedAccountsSectionModule: StoryModule = {
  meta: userProfileConnectedAccountsSectionMeta,
  Default: UserProfileConnectedAccountsSectionDefault,
  LinkedAccounts: ConnectedAccountsLinkedAccounts,
  ConnectOnly: ConnectedAccountsConnectOnly,
  ReconnectRequired: ConnectedAccountsReconnectRequired,
  VerificationError: ConnectedAccountsVerificationError,
  ConnectionError: ConnectedAccountsConnectionError,
  RemovalPending: ConnectedAccountsRemovalPending,
  RemovalError: ConnectedAccountsRemovalError,
};
const userProfileWeb3WalletsSectionModule: StoryModule = {
  meta: userProfileWeb3WalletsSectionMeta,
  Default: UserProfileWeb3WalletsSectionDefault,
  ConnectedWallets: UserProfileWeb3WalletsSectionConnectedWallets,
  ConnectOnly: UserProfileWeb3WalletsSectionConnectOnly,
  ConnectionError: UserProfileWeb3WalletsSectionConnectionError,
  PrimaryError: UserProfileWeb3WalletsSectionPrimaryError,
  RemovalPending: UserProfileWeb3WalletsSectionRemovalPending,
  RemovalError: UserProfileWeb3WalletsSectionRemovalError,
  UnverifiedWallet: UserProfileWeb3WalletsSectionUnverifiedWallet,
};
const userProfileDeleteSectionModule: StoryModule = {
  meta: userProfileDeleteSectionMeta,
  Default: UserProfileDeleteSectionDefault,
  WithError: UserProfileDeleteSectionWithError,
};

const confirmationModule: StoryModule = {
  meta: confirmationMeta,
  Default: ConfirmationDefault,
  WithError: ConfirmationWithError,
};

const destructiveModule: StoryModule = {
  meta: destructiveMeta,
  Default: DestructiveDefault,
  WithError: DestructiveWithError,
};

const reverificationModule: StoryModule = {
  meta: reverificationMeta,
  Default: ReverificationDefault,
  Password: ReverificationPassword,
  PasswordPending: ReverificationPasswordPending,
  PasswordError: ReverificationPasswordError,
  Passkey: ReverificationPasskey,
  PasskeyPending: ReverificationPasskeyPending,
  PasskeyError: ReverificationPasskeyError,
  OTP: ReverificationOTP,
  AuthenticatorOTP: ReverificationAuthenticatorOTP,
  OTPPending: ReverificationOTPPending,
  OTPError: ReverificationOTPError,
  OTPResending: ReverificationOTPResending,
  BackupCode: ReverificationBackupCode,
  BackupCodePending: ReverificationBackupCodePending,
  BackupCodeError: ReverificationBackupCodeError,
  MethodPicker: ReverificationMethodPicker,
  MethodPickerPending: ReverificationMethodPickerPending,
  Help: ReverificationHelp,
};
export const registry: StoryModule[] = [
  // User Button
  userButtonModule,
  // User Profile
  userProfileModule,
  // User Profile · Panels
  userProfileProfilePanelModule,
  userProfileSecurityPanelModule,
  userProfileBillingPanelModule,
  userProfileApiKeysPanelModule,
  // User Profile · Sections
  userProfileAccountSectionModule,
  userProfilePasswordSectionModule,
  userProfilePasskeysSectionModule,
  userProfileMfaSectionModule,
  userProfileActiveDevicesSectionModule,
  userProfileSubscriptionSectionModule,
  userProfilePaymentMethodsSectionModule,
  userProfileBillingHistorySectionModule,
  userProfileConnectedAccountsSectionModule,
  userProfileEnterpriseAccountsSectionModule,
  userProfileWeb3WalletsSectionModule,
  userProfileDeleteSectionModule,
  // Organization Profile
  organizationProfileModule,
  // Organization Profile · Panels
  organizationProfileGeneralPanelModule,
  organizationProfileMembersPanelModule,
  organizationProfileSecurityPanelModule,
  organizationProfileBillingPanelModule,
  organizationProfileApiKeysPanelModule,
  // Organization Profile · Sections
  organizationProfileInvitationsTabModule,
  organizationProfileRequestsTabModule,
  // Reverification
  reverificationModule,
  // Blocks — flows assembled from components, wired by the caller's machine.
  confirmationModule,
  destructiveModule,
  // Components
  actionBarModule,
  avatarModule,
  badgeModule,
  bannerModule,
  buttonModule,
  cardComponentModule,
  checkboxModule,
  comboboxModule,
  flowComponentModule,
  inputModule,
  inputGroupModule,
  phoneInputModule,
  dataListModule,
  itemModule,
  dialogComponentModule,
  drawerComponentModule,
  emptyStateModule,
  headingModule,
  iconModule,
  iconFrameModule,
  menuComponentModule,
  otpComponentModule,
  paginationModule,
  popoverComponentModule,
  profileComponentModule,
  sectionModule,
  selectComponentModule,
  tableModule,
  tabsComponentModule,
  textModule,
  toastModule,
  tooltipComponentModule,
  fieldModule,
  visuallyHiddenModule,
  // Primitives
  accordionModule,
  autocompleteModule,
  comboboxPrimitiveModule,
  collapsibleModule,
  dialogModule,
  drawerModule,
  fileUploadModule,
  flowModule,
  menuModule,
  otpModule,
  popoverModule,
  selectModule,
  tabsModule,
  toastPrimitiveModule,
  tooltipModule,
  // Styles — atomic styles that ship as StyleX atoms rather than components.
  scrollAreaModule,
  // Hooks
  useDataTableModule,
  // Localization
  localizationModule,
];

/**
 * Look up a component's story module by its group + component slug (both derived from `meta`).
 * Group-aware so identically-titled entries in different groups (e.g. the headless `Dialog`
 * primitive and the styled `Dialog` component) resolve to distinct pages.
 */
export function getModule(groupSlug: string, componentSlug: string): StoryModule | undefined {
  return registry.find(mod => toSlug(mod.meta.group) === groupSlug && toSlug(mod.meta.title) === componentSlug);
}

const ALPHABETICAL_GROUPS = new Set(['Blocks', 'Components', 'Primitives', 'Styles', 'Hooks']);

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
    components: ALPHABETICAL_GROUPS.has(group)
      ? [...components].sort((a, b) => a.mod.meta.title.localeCompare(b.mod.meta.title))
      : components,
  }));
}
