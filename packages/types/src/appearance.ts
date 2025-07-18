import type * as CSS from 'csstype';

import type {
  AlertId,
  CardActionId,
  FieldId,
  MenuId,
  OrganizationPreviewId,
  ProfilePageId,
  ProfileSectionId,
  SelectId,
  UserPreviewId,
} from './elementIds';
import type { EnterpriseProvider } from './enterpriseAccount';
import type { OAuthProvider } from './oauth';
import type { PhoneCodeChannel } from './phoneCodeChannel';
import type { SamlIdpSlug } from './saml';
import type { BuiltInColors, TransparentColor } from './theme';
import type { Web3Provider } from './web3';

type CSSProperties = CSS.PropertiesFallback<number | string>;
type CSSPropertiesWithMultiValues = { [K in keyof CSSProperties]: CSSProperties[K] };
type CSSPseudos = { [K in CSS.Pseudos as `&${K}`]?: CSSObject };

interface CSSObject extends CSSPropertiesWithMultiValues, CSSPseudos {}

type UserDefinedStyle = string | CSSObject;

type Shade =
  | '25'
  | '50'
  | '100'
  | '150'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '750'
  | '800'
  | '850'
  | '900'
  | '950';
export type ColorScale<T = string> = Record<Shade, T>;
export type AlphaColorScale<T = string> = {
  [K in Shade]: T;
};

export type ColorScaleWithRequiredBase<T = string> = Partial<ColorScale<T>> & { '500': T };

export type CssColorOrScale = string | ColorScaleWithRequiredBase;
export type CssColorOrAlphaScale = string | AlphaColorScale;
type CssColor = string | TransparentColor | BuiltInColors;
type CssLengthUnit = string;

type FontSizeScale = {
  xs?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
};

type FontWeightNamedValue = CSS.Properties['fontWeight'];
type FontWeightNumericValue = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

type FontWeightScale = {
  normal?: FontWeightNamedValue | FontWeightNumericValue;
  medium?: FontWeightNamedValue | FontWeightNumericValue;
  semibold?: FontWeightNamedValue | FontWeightNumericValue;
  bold?: FontWeightNamedValue | FontWeightNumericValue;
};

type WebSafeFont =
  | 'Arial'
  | 'Brush Script MT'
  | 'Courier New'
  | 'Garamond'
  | 'Georgia'
  | 'Helvetica'
  | 'Tahoma'
  | 'Times New Roman'
  | 'Trebuchet MS'
  | 'Verdana';

export type FontFamily = string | WebSafeFont;

type LoadingState = 'loading';
type ErrorState = 'error';
type OpenState = 'open';
type ActiveState = 'active';
export type ElementState = LoadingState | ErrorState | OpenState | ActiveState;
type ControlState = ErrorState;

/**
 * A type that describes the states and the ids that we will combine
 * in order to create all theming combinations
 * If jsx exists, the element can also receive a typed function that returns a JSX.Element
 */
type ConfigOptions = { states: ElementState; ids: string; jsx: any };
type WithOptions<Ids = never, States = never, Jsx = never> = { ids: Ids; states: States; jsx: Jsx };

/**
 * Create a type union of all state + id combinations
 */
export type StateSelectors<E extends string, S extends ElementState | undefined = never> = S extends never
  ? never
  : `${E}__${S}`;

/**
 * Create a type union consisting of the base element with all valid ids appended
 */
export type IdSelectors<E extends string, Id extends string | undefined = never> = Id extends never
  ? never
  : `${E}__${Id}`;

/**
 * Create a type union consisting of all base, base+state, base+id, base+id+state combinations
 */
type ElementPartsKeys<Name extends string, Opts extends ConfigOptions> =
  | StateSelectors<Name, Opts['states']>
  | IdSelectors<Name, Opts['ids']>
  | StateSelectors<IdSelectors<Name, Opts['ids']>, Opts['states']>;

/**
 * Create an object type mapping base elements and part combinations (base, base+state, base+id, base+id+state)
 * to the value they can accept (usually a style rule, a string class or jsx)
 */
type Selectors<RootElemName extends string, Opts extends ConfigOptions> =
  | Partial<Record<RootElemName, UserDefinedStyle | Opts['jsx']>>
  | Partial<Record<ElementPartsKeys<RootElemName, Opts>, UserDefinedStyle>>;

/**
 * Convert a kebab-cased key from ElementsConfig into a camelCased Elements key
 */
export type ElementObjectKey<K extends string> = K extends `${infer Parent}-${infer Rest}`
  ? `${Parent}${Capitalize<Rest>}`
  : K;

/**
 * A map that describes the possible combinations we need to generate
 * for each unique base element
 * Kebab-case is used to differentiate between the container and child elements
 */
export type ElementsConfig = {
  button: WithOptions<string>;
  input: WithOptions;
  checkbox: WithOptions;
  radio: WithOptions;
  table: WithOptions;

  rootBox: WithOptions;
  cardBox: WithOptions;
  card: WithOptions;
  actionCard: WithOptions;
  popoverBox: WithOptions;

  disclosureRoot: WithOptions;
  disclosureTrigger: WithOptions;
  disclosureContentRoot: WithOptions;
  disclosureContentInner: WithOptions;
  disclosureContent: WithOptions;

  lineItemsRoot: WithOptions;
  lineItemsDivider: WithOptions;
  lineItemsGroup: WithOptions<'primary' | 'secondary' | 'tertiary'>;
  lineItemsTitle: WithOptions<'primary' | 'secondary' | 'tertiary'>;
  lineItemsTitleDescription: WithOptions;
  lineItemsDescription: WithOptions<'primary' | 'secondary' | 'tertiary'>;
  lineItemsDescriptionInner: WithOptions;
  lineItemsDescriptionText: WithOptions;
  lineItemsDescriptionSuffix: WithOptions;
  lineItemsDescriptionPrefix: WithOptions;
  lineItemsCopyButton: WithOptions;
  lineItemsDowngradeNotice: WithOptions;

  logoBox: WithOptions;
  logoImage: WithOptions;

  header: WithOptions;
  headerTitle: WithOptions;
  headerSubtitle: WithOptions;
  headerBackLink: WithOptions;

  backRow: WithOptions;
  backLink: WithOptions;

  main: WithOptions;

  footer: WithOptions;
  footerItem: WithOptions;
  footerAction: WithOptions<CardActionId>;
  footerActionText: WithOptions;
  footerActionLink: WithOptions;
  footerPages: WithOptions;
  footerPagesLink: WithOptions<'help' | 'terms' | 'privacy'>;

  socialButtonsRoot: WithOptions;
  socialButtons: WithOptions;
  socialButtonsIconButton: WithOptions<OAuthProvider | Web3Provider | PhoneCodeChannel, LoadingState>;
  socialButtonsBlockButton: WithOptions<OAuthProvider | Web3Provider | PhoneCodeChannel, LoadingState>;
  socialButtonsBlockButtonText: WithOptions<OAuthProvider | Web3Provider | PhoneCodeChannel>;
  socialButtonsProviderIcon: WithOptions<OAuthProvider | Web3Provider | PhoneCodeChannel, LoadingState>;
  socialButtonsProviderInitialIcon: WithOptions<OAuthProvider | Web3Provider | PhoneCodeChannel, LoadingState>;

  enterpriseButtonsProviderIcon: WithOptions<EnterpriseProvider, LoadingState>;

  providerIcon: WithOptions<OAuthProvider | Web3Provider | PhoneCodeChannel | SamlIdpSlug, LoadingState>;
  providerInitialIcon: WithOptions<OAuthProvider | Web3Provider | PhoneCodeChannel | SamlIdpSlug, LoadingState>;

  alternativeMethods: WithOptions;
  alternativeMethodsBlockButton: WithOptions<OAuthProvider | Web3Provider | PhoneCodeChannel, LoadingState>;
  alternativeMethodsBlockButtonText: WithOptions<OAuthProvider | Web3Provider | PhoneCodeChannel>;
  alternativeMethodsBlockButtonArrow: WithOptions<OAuthProvider | Web3Provider | PhoneCodeChannel>;

  checkoutFormLineItemsRoot: WithOptions;
  checkoutFormElementsRoot: WithOptions;

  checkoutSuccessRoot: WithOptions;
  checkoutSuccessRings: WithOptions;
  checkoutSuccessBadge: WithOptions;
  checkoutSuccessTitle: WithOptions;
  checkoutSuccessDescription: WithOptions;

  otpCodeField: WithOptions;
  otpCodeFieldInputs: WithOptions;
  otpCodeFieldInput: WithOptions;
  otpCodeFieldInputContainer: WithOptions;
  otpCodeFieldErrorText: WithOptions;

  dividerRow: WithOptions;
  dividerColumn: WithOptions;
  dividerText: WithOptions;
  dividerLine: WithOptions;

  drawerBackdrop: WithOptions;
  drawerRoot: WithOptions;
  drawerContent: WithOptions;
  drawerHeader: WithOptions;
  drawerTitle: WithOptions;
  drawerBody: WithOptions;
  drawerFooter: WithOptions;
  drawerFooterTitle: WithOptions;
  drawerFooterDescription: WithOptions;
  drawerClose: WithOptions;
  drawerConfirmationBackdrop: WithOptions;
  drawerConfirmationRoot: WithOptions;
  drawerConfirmationTitle: WithOptions;
  drawerConfirmationDescription: WithOptions;
  drawerConfirmationActions: WithOptions;

  formHeader: WithOptions<never, ErrorState>;
  formHeaderTitle: WithOptions<never, ErrorState>;
  formHeaderSubtitle: WithOptions<never, ErrorState>;
  formResendCodeLink: WithOptions;

  verificationLinkStatusBox: WithOptions;
  verificationLinkStatusIconBox: WithOptions;
  verificationLinkStatusIcon: WithOptions;
  verificationLinkStatusText: WithOptions;

  form: WithOptions<never, ErrorState>;
  formContainer: WithOptions<never, ErrorState>;
  formFieldRow: WithOptions<FieldId>;
  formField: WithOptions<FieldId, ControlState>;
  formFieldLabelRow: WithOptions<FieldId, ControlState>;
  formFieldLabel: WithOptions<FieldId, ControlState>;
  formFieldRadioGroup: WithOptions;
  formFieldRadioGroupItem: WithOptions;
  formFieldRadioInput: WithOptions;
  formFieldRadioLabel: WithOptions<FieldId, ControlState>;
  formFieldRadioLabelTitle: WithOptions<FieldId, ControlState>;
  formFieldRadioLabelDescription: WithOptions<FieldId, ControlState>;
  formFieldCheckboxInput: WithOptions<FieldId, ControlState>;
  formFieldCheckboxLabel: WithOptions<FieldId, ControlState>;
  formFieldAction: WithOptions<FieldId, ControlState>;
  formFieldInput: WithOptions<FieldId, ControlState>;
  formFieldErrorText: WithOptions<FieldId, ControlState>;
  formFieldWarningText: WithOptions<FieldId, ControlState>;
  formFieldSuccessText: WithOptions<FieldId, ControlState>;
  formFieldInfoText: WithOptions<FieldId, ControlState>;
  formFieldHintText: WithOptions<FieldId, ControlState>;
  formButtonPrimary: WithOptions<never, ControlState | LoadingState>;
  formButtonReset: WithOptions<never, ControlState | LoadingState>;
  formFieldInputGroup: WithOptions;
  formFieldInputShowPasswordButton: WithOptions;
  formFieldInputShowPasswordIcon: WithOptions;
  formFieldInputCopyToClipboardButton: WithOptions;
  formFieldInputCopyToClipboardIcon: WithOptions;

  phoneInputBox: WithOptions<never, ControlState>;
  formInputGroup: WithOptions<never, ControlState>;

  segmentedControlRoot: WithOptions;
  segmentedControlButton: WithOptions;

  switchRoot: WithOptions;
  switchIndicator: WithOptions;
  switchThumb: WithOptions;
  switchLabel: WithOptions;

  avatarBox: WithOptions;
  avatarImage: WithOptions;
  avatarImageActions: WithOptions;
  avatarImageActionsUpload: WithOptions;
  avatarImageActionsRemove: WithOptions;

  // TODO: We can remove "Popover" from these:
  userButtonBox: WithOptions<never, 'open'>;
  userButtonOuterIdentifier: WithOptions<never, 'open'>;
  userButtonTrigger: WithOptions<never, 'open'>;
  userButtonAvatarBox: WithOptions<never, 'open'>;
  userButtonAvatarImage: WithOptions<never, 'open'>;
  userButtonPopoverRootBox: WithOptions;
  userButtonPopoverCard: WithOptions;
  userButtonPopoverMain: WithOptions;
  userButtonPopoverActions: WithOptions<'singleSession' | 'multiSession'>;
  userButtonPopoverActionButton: WithOptions<'manageAccount' | 'addAccount' | 'signOut' | 'signOutAll'>;
  userButtonPopoverActionButtonIconBox: WithOptions<'manageAccount' | 'addAccount' | 'signOut' | 'signOutAll'>;
  userButtonPopoverActionButtonIcon: WithOptions<'manageAccount' | 'addAccount' | 'signOut' | 'signOutAll'>;
  userButtonPopoverCustomItemButton: WithOptions<string>;
  userButtonPopoverCustomItemButtonIconBox: WithOptions<string>;
  userButtonPopoverActionItemButtonIcon: WithOptions<string>;
  userButtonPopoverFooter: WithOptions;
  userButtonPopoverFooterPagesLink: WithOptions<'terms' | 'privacy'>;

  organizationSwitcherTrigger: WithOptions<'personal' | 'organization', 'open'>;
  organizationSwitcherTriggerIcon: WithOptions<never, 'open'>;
  organizationSwitcherPopoverRootBox: WithOptions;
  organizationSwitcherPopoverCard: WithOptions;
  organizationSwitcherPopoverMain: WithOptions;
  organizationSwitcherPopoverActions: WithOptions;
  organizationSwitcherPopoverInvitationActions: WithOptions;
  organizationSwitcherPopoverInvitationActionsBox: WithOptions;
  organizationSwitcherPopoverActionButton: WithOptions<
    'manageOrganization' | 'createOrganization' | 'switchOrganization'
  >;
  organizationSwitcherPreviewButton: WithOptions<'personal' | 'organization'>;
  organizationSwitcherInvitationAcceptButton: WithOptions;
  organizationSwitcherPopoverActionButtonIconBox: WithOptions<'manageOrganization' | 'createOrganization'>;
  organizationSwitcherPopoverActionButtonIcon: WithOptions<'manageOrganization' | 'createOrganization'>;
  organizationSwitcherPopoverFooter: WithOptions;

  organizationProfileMembersSearchInputIcon: WithOptions;
  organizationProfileMembersSearchInput: WithOptions;

  organizationListPreviewItems: WithOptions;
  organizationListPreviewItem: WithOptions;
  organizationListPreviewButton: WithOptions;
  organizationListPreviewItemActionButton: WithOptions;
  organizationListCreateOrganizationActionButton: WithOptions;

  // TODO: Test this idea. Instead of userButtonUserPreview, have a userPreview__userButton instead
  // Same for other repeated selectors, eg avatar
  userPreview: WithOptions<UserPreviewId>;
  userPreviewAvatarContainer: WithOptions<UserPreviewId>;
  userPreviewAvatarBox: WithOptions<UserPreviewId>;
  userPreviewAvatarImage: WithOptions<UserPreviewId>;
  userPreviewAvatarIcon: WithOptions<UserPreviewId>;
  userPreviewTextContainer: WithOptions<UserPreviewId>;
  userPreviewMainIdentifier: WithOptions<UserPreviewId>;
  userPreviewMainIdentifierText: WithOptions<UserPreviewId>;
  userPreviewSecondaryIdentifier: WithOptions<UserPreviewId>;

  organizationPreview: WithOptions<OrganizationPreviewId>;
  organizationPreviewAvatarContainer: WithOptions<OrganizationPreviewId>;
  organizationPreviewAvatarBox: WithOptions<OrganizationPreviewId>;
  organizationPreviewAvatarImage: WithOptions<OrganizationPreviewId>;
  organizationPreviewTextContainer: WithOptions<OrganizationPreviewId>;
  organizationPreviewMainIdentifier: WithOptions<OrganizationPreviewId>;
  organizationPreviewSecondaryIdentifier: WithOptions<OrganizationPreviewId>;

  organizationAvatarUploaderContainer: WithOptions;

  membersPageInviteButton: WithOptions;

  identityPreview: WithOptions;
  identityPreviewText: WithOptions;
  identityPreviewEditButton: WithOptions;
  identityPreviewEditButtonIcon: WithOptions;

  passkeyIcon: WithOptions<'firstFactor'>;

  accountSwitcherActionButton: WithOptions<'addAccount' | 'signOutAll'>;
  accountSwitcherActionButtonIconBox: WithOptions<'addAccount' | 'signOutAll'>;
  accountSwitcherActionButtonIcon: WithOptions<'addAccount' | 'signOutAll'>;

  pricingTable: WithOptions;
  pricingTableCard: WithOptions<string>;
  pricingTableCardHeader: WithOptions;
  pricingTableCardTitleContainer: WithOptions;
  pricingTableCardTitle: WithOptions;
  pricingTableCardDescription: WithOptions;
  pricingTableCardFeeContainer: WithOptions;
  pricingTableCardFee: WithOptions;
  pricingTableCardFeePeriod: WithOptions;
  pricingTableCardPeriodToggle: WithOptions;
  pricingTableCardFeePeriodNotice: WithOptions;
  pricingTableCardBody: WithOptions;
  pricingTableCardFeatures: WithOptions;
  pricingTableCardFeaturesList: WithOptions<string>;
  pricingTableCardFeaturesListItem: WithOptions<string>;
  pricingTableCardFeaturesListItemContent: WithOptions;
  pricingTableCardFeaturesListItemTitle: WithOptions;
  pricingTableCardStatusRow: WithOptions;
  pricingTableCardStatus: WithOptions;
  pricingTableCardFooter: WithOptions;
  pricingTableCardFooterButton: WithOptions;
  pricingTableCardFooterNotice: WithOptions;

  pricingTableMatrix: WithOptions;
  pricingTableMatrixTable: WithOptions;
  pricingTableMatrixRowGroup: WithOptions;
  pricingTableMatrixRowGroupHeader: WithOptions;
  pricingTableMatrixRowGroupBody: WithOptions;
  pricingTableMatrixRow: WithOptions;
  pricingTableMatrixRowHeader: WithOptions;
  pricingTableMatrixRowBody: WithOptions;
  pricingTableMatrixColumnHeader: WithOptions;
  pricingTableMatrixCell: WithOptions;
  pricingTableMatrixCellFooter: WithOptions;
  pricingTableMatrixAvatar: WithOptions;
  pricingTableMatrixBadge: WithOptions;
  pricingTableMatrixPlanName: WithOptions;
  pricingTableMatrixFee: WithOptions;
  pricingTableMatrixFeePeriod: WithOptions;
  pricingTableMatrixFeePeriodNotice: WithOptions;
  pricingTableMatrixFeePeriodNoticeInner: WithOptions;
  pricingTableMatrixFeePeriodNoticeLabel: WithOptions;
  pricingTableMatrixFooter: WithOptions;

  planDetailHeader: WithOptions;
  planDetailAvatar: WithOptions;
  planDetailBadgeAvatarTitleDescriptionContainer: WithOptions;
  planDetailBadgeContainer: WithOptions;
  planDetailBadge: WithOptions;
  planDetailTitle: WithOptions;
  planDetailTitleDescriptionContainer: WithOptions;
  planDetailDescription: WithOptions;
  planDetailAction: WithOptions;
  planDetailFeeContainer: WithOptions;
  planDetailFee: WithOptions;
  planDetailFeePeriod: WithOptions;
  planDetailFeePeriodNotice: WithOptions;
  planDetailFeePeriodNoticeInner: WithOptions;
  planDetailFeePeriodNoticeLabel: WithOptions;
  planDetailCaption: WithOptions;
  planDetailFeatures: WithOptions;
  planDetailFeaturesList: WithOptions<string>;
  planDetailFeaturesListItem: WithOptions<string>;
  planDetailFeaturesListItemContent: WithOptions;
  planDetailFeaturesListItemTitle: WithOptions;
  planDetailFeaturesListItemDescription: WithOptions;
  planDetailPeriodToggle: WithOptions;

  alert: WithOptions<AlertId>;
  alertIcon: WithOptions<AlertId>;
  alertText: WithOptions<AlertId>;
  alertTextContainer: WithOptions<AlertId>;

  tagInputContainer: WithOptions;
  tagPillIcon: WithOptions;
  tagPillContainer: WithOptions;

  tabPanel: WithOptions;
  tabButton: WithOptions;
  tabListContainer: WithOptions;

  tableHead: WithOptions;
  tableBody: WithOptions;
  tableRow: WithOptions;
  tableHeaderCell: WithOptions;
  tableBodyCell: WithOptions;

  paginationButton: WithOptions;
  paginationButtonIcon: WithOptions;
  paginationRowText: WithOptions<'allRowsCount' | 'rowsCount' | 'displaying'>;

  selectButton: WithOptions<SelectId>;
  selectSearchInput: WithOptions<SelectId>;
  selectButtonIcon: WithOptions<SelectId>;
  selectOptionsContainer: WithOptions<SelectId>;
  selectOption: WithOptions<SelectId>;

  paymentSourceRow: WithOptions;
  paymentSourceRowIcon: WithOptions;
  paymentSourceRowText: WithOptions;
  paymentSourceRowType: WithOptions;
  paymentSourceRowValue: WithOptions;
  paymentSourceRowBadge: WithOptions<'default' | 'expired'>;

  statementRoot: WithOptions;
  statementHeader: WithOptions;
  statementHeaderTitle: WithOptions;
  statementHeaderBadge: WithOptions;
  statementBody: WithOptions;
  statementSection: WithOptions;
  statementSectionHeader: WithOptions;
  statementHeaderTitleContainer: WithOptions;
  statementSectionHeaderTitle: WithOptions;
  statementSectionContent: WithOptions;
  statementSectionContentItem: WithOptions;
  statementSectionContentDetailsList: WithOptions;
  statementSectionContentDetailsListItem: WithOptions;
  statementSectionContentDetailsListItemLabelContainer: WithOptions;
  statementSectionContentDetailsListItemLabel: WithOptions;
  statementSectionContentDetailsListItemValue: WithOptions;
  statementSectionContentDetailsHeader: WithOptions;
  statementSectionContentDetailsHeaderItem: WithOptions;
  statementSectionContentDetailsHeaderItemIcon: WithOptions;
  statementSectionContentDetailsHeaderTitle: WithOptions;
  statementSectionContentDetailsHeaderDescription: WithOptions;
  statementSectionContentDetailsHeaderSecondaryTitle: WithOptions;
  statementSectionContentDetailsHeaderSecondaryDescription: WithOptions;
  statementFooter: WithOptions;
  statementFooterLabel: WithOptions;
  statementFooterValueContainer: WithOptions;
  statementFooterCurrency: WithOptions;
  statementFooterValue: WithOptions;
  statementCopyButton: WithOptions;
  menuButton: WithOptions<MenuId>;
  menuButtonEllipsis: WithOptions;
  menuButtonEllipsisBordered: WithOptions;
  menuList: WithOptions<MenuId>;
  menuItem: WithOptions<MenuId>;

  paymentAttemptRoot: WithOptions;
  paymentAttemptHeader: WithOptions;
  paymentAttemptHeaderTitleContainer: WithOptions;
  paymentAttemptHeaderTitle: WithOptions;
  paymentAttemptHeaderBadge: WithOptions;
  paymentAttemptBody: WithOptions;
  paymentAttemptFooter: WithOptions;
  paymentAttemptFooterLabel: WithOptions;
  paymentAttemptFooterValueContainer: WithOptions;
  paymentAttemptFooterCurrency: WithOptions;
  paymentAttemptFooterValue: WithOptions;
  paymentAttemptCopyButton: WithOptions;

  modalBackdrop: WithOptions;
  modalContent: WithOptions;
  modalCloseButton: WithOptions;

  profileSection: WithOptions<ProfileSectionId>;
  profileSectionItemList: WithOptions<ProfileSectionId>;
  profileSectionItem: WithOptions<ProfileSectionId>;
  profileSectionHeader: WithOptions<ProfileSectionId>;
  profileSectionTitle: WithOptions<ProfileSectionId>;
  profileSectionTitleText: WithOptions<ProfileSectionId>;
  profileSectionSubtitle: WithOptions<ProfileSectionId>;
  profileSectionSubtitleText: WithOptions<ProfileSectionId>;
  profileSectionContent: WithOptions<ProfileSectionId>;
  profileSectionPrimaryButton: WithOptions<ProfileSectionId>;
  profilePage: WithOptions<ProfilePageId>;

  // TODO: review
  formattedPhoneNumber: WithOptions;
  formattedPhoneNumberFlag: WithOptions;
  formattedPhoneNumberText: WithOptions;

  formattedDate: WithOptions<'tableCell'>;

  scrollBox: WithOptions;

  navbar: WithOptions;
  navbarButtons: WithOptions<never, ActiveState>;
  navbarButton: WithOptions<string, ActiveState>;
  navbarButtonIcon: WithOptions<string, ActiveState>;
  navbarButtonText: WithOptions<string, ActiveState>;
  navbarMobileMenuRow: WithOptions;
  navbarMobileMenuButton: WithOptions;
  navbarMobileMenuButtonIcon: WithOptions;

  pageScrollBox: WithOptions;
  page: WithOptions;

  activeDevice: WithOptions<'current'>;
  activeDeviceListItem: WithOptions<'current'>;
  activeDeviceIcon: WithOptions<'mobile' | 'desktop'>;

  impersonationFab: WithOptions;
  impersonationFabIcon: WithOptions;
  impersonationFabIconContainer: WithOptions;
  impersonationFabTitle: WithOptions;
  impersonationFabActionLink: WithOptions;

  tooltip: WithOptions;
  tooltipContent: WithOptions;
  tooltipText: WithOptions;

  invitationsSentIconBox: WithOptions;
  invitationsSentIcon: WithOptions;

  qrCodeRow: WithOptions;
  qrCodeContainer: WithOptions;

  // default descriptors
  badge: WithOptions<'primary' | 'actionRequired'>;
  notificationBadge: WithOptions;
  buttonArrowIcon: WithOptions;
  spinner: WithOptions;

  apiKeys: WithOptions;
  apiKeysHeader: WithOptions;
  apiKeysSearchBox: WithOptions;
  apiKeysSearchInput: WithOptions;
  apiKeysAddButton: WithOptions;
  apiKeysTable: WithOptions;
  apiKeysCopyButton: WithOptions<string>;
  apiKeysRevealButton: WithOptions<string>;
  apiKeysCreateForm: WithOptions;
  apiKeysCreateFormNameInput: WithOptions;
  apiKeysCreateFormDescriptionInput: WithOptions;
  apiKeysCreateFormExpirationInput: WithOptions;
  apiKeysCreateFormSubmitButton: WithOptions;
  apiKeysCreateFormExpirationCaption: WithOptions;
  apiKeysRevokeModal: WithOptions;
  apiKeysRevokeModalInput: WithOptions;
  apiKeysRevokeModalSubmitButton: WithOptions;

  subscriptionDetailsCard: WithOptions;
  subscriptionDetailsCardHeader: WithOptions;
  subscriptionDetailsCardBadge: WithOptions;
  subscriptionDetailsCardTitle: WithOptions;
  subscriptionDetailsCardBody: WithOptions;
  subscriptionDetailsCardFooter: WithOptions;
  subscriptionDetailsCardActions: WithOptions;
  subscriptionDetailsDetailRow: WithOptions;
  subscriptionDetailsDetailRowLabel: WithOptions;
  subscriptionDetailsDetailRowValue: WithOptions;
};

export type Elements = {
  [k in keyof ElementsConfig]: Selectors<ElementObjectKey<k> & string, ElementsConfig[k]>;
}[keyof ElementsConfig];

export type Variables = {
  /**
   * The primary color used throughout the components. Set this to your brand color.
   * @default '#2F3037'
   */
  colorPrimary?: CssColorOrScale;
  /**
   * The color of text appearing on top of an element that with a background color of {@link Variables.colorPrimary},
   * eg: solid primary buttons.
   * @deprecated Use {@link Variables.colorPrimaryForeground} instead.
   * @default 'white'
   */
  colorTextOnPrimaryBackground?: CssColor;
  /**
   * The color of text appearing on top of an element that with a background color of {@link Variables.colorPrimary},
   * eg: solid primary buttons.
   * @default 'white'
   */
  colorPrimaryForeground?: CssColor;
  /**
   * The color used to indicate errors or destructive actions. Set this to your brand's danger color.
   * @default '#EF4444'
   */
  colorDanger?: CssColorOrScale;
  /**
   * The color used to indicate an action that completed successfully or a positive result.
   * @default '#22C543'
   */
  colorSuccess?: CssColorOrScale;
  /**
   * The color used for potentially destructive actions or when the user's attention is required.
   * @default '#F36B16'
   */
  colorWarning?: CssColorOrScale;
  /**
   * The color that will be used as the neutral color for all the components. To achieve sufficient contrast,
   * light themes should be using dark shades ('black'), while dark themes should be using light shades ('white').
   * This option applies to borders, backgrounds for hovered elements, hovered dropdown options etc.
   * @default 'black'
   */
  colorNeutral?: CssColorOrAlphaScale;
  /**
   * The default text color.
   * @deprecated Use {@link Variables.colorForeground} instead.
   * @default '#212126'
   */
  colorText?: CssColor;
  /**
   * The default text color.
   * @default 'inherit'
   */
  colorForeground?: CssColor;
  /**
   * The background color for elements of lower importance, eg: a muted background.
   * his color is a lighter shade of {@link Variables.background} and {@link Variables.colorNeutral}.
   */
  colorMuted?: CssColor;
  /**
   * The text color for elements of lower importance, eg: a subtitle text.
   * This color is a lighter shade of {@link Variables.colorText}.
   * @deprecated Use {@link Variables.colorMutedForeground} instead.
   * @default '#747686'
   */
  colorTextSecondary?: CssColor;
  /**
   * The text color for elements of lower importance, eg: a subtitle text.
   * This color is a lighter shade of {@link Variables.colorText}.
   * @default '#747686'
   */
  colorMutedForeground?: CssColor;
  /**
   * The background color for the card container.
   * @default 'white'
   */
  colorBackground?: CssColor;
  /**
   * The default text color inside input elements. To customise the input background color instead, use {@link Variables.colorInputBackground}.
   * @deprecated Use {@link Variables.colorInputForeground} instead.
   * @default 'black'
   */
  colorInputText?: CssColor;
  /**
   * The default text color inside input elements. To customise the input background color instead, use {@link Variables.colorInputBackground}.
   * @default 'black'
   */
  colorInputForeground?: CssColor;
  /**
   * The background color for all input elements.
   * @deprecated Use {@link Variables.colorInput} instead.
   * @default 'white'
   */
  colorInputBackground?: CssColor;
  /**
   * The background color for all input elements.
   * @default 'white'
   */
  colorInput?: CssColor;
  /**
   * The color of the avatar shimmer
   * @default 'rgba(255, 255, 255, 0.36)'
   */
  colorShimmer?: CssColor;
  /**
   * The color of the ring when an interactive element is focused rendered at 15% opacity.
   * @default {@link Variables.colorNeutral} at 15% opacity
   */
  colorRing?: CssColor;
  /**
   * The base shadow color used in the components.
   * @default '#000000'
   */
  colorShadow?: CssColor;
  /**
   * The base border color used in the components.
   * @default {@link Variables.colorNeutral}
   */
  colorBorder?: CssColor;
  /**
   * The background color of the modal backdrop rendered at 73% opacity.
   * @default {@link Variables.colorNeutral} at 73% opacity
   */
  colorModalBackdrop?: CssColor;
  /**
   * The default font that will be used in all components.
   * This can be the name of a custom font loaded by your code or the name of a web-safe font ((@link WebSafeFont})
   * If a specific fontFamily is not provided, the components will inherit the font of the parent element.
   * @default 'inherit'
   * @example
   * { fontFamily: 'Montserrat' }
   */
  fontFamily?: FontFamily;
  /**
   * The default font that will be used in all buttons. See {@link Variables.fontFamily} for details.
   * If not provided, {@link Variables.fontFamily} will be used instead.
   * @default 'inherit'
   */
  fontFamilyButtons?: FontFamily;
  /**
   * The value will be used as the base `md` to calculate all the other scale values (`xs`, `sm`, `lg` and `xl`).
   * By default, this value is relative to the root fontSize of the html element.
   * @default '0.8125rem'
   */
  fontSize?: CssLengthUnit | FontSizeScale;
  /**
   * The font weight the components will use. By default, the components will use the 400, 500, 600 and 700 weights
   * for normal, medium, semibold and bold text respectively.
   * You can override the default weights by passing a {@link FontWeightScale} object
   * @default { normal: 400, medium: 500, semibold: 600, bold: 700 };
   */
  fontWeight?: FontWeightScale;
  /**
   * The size that will be used as the `md` base borderRadius value. This is used as the base to calculate the `sm`, `lg`, `xl`,
   * our components use. As a general rule, the bigger an element is, the larger its borderRadius is going to be.
   * eg: the Card element uses 'xl'
   * @default '0.375rem'
   */
  borderRadius?: CssLengthUnit;
  /**
   * The base spacing unit that all margins, paddings and gaps between the elements are derived from.
   * @deprecated Use {@link Variables.spacing} instead.
   * @default '1rem'
   */
  spacingUnit?: CssLengthUnit;
  /**
   * The base spacing that all margins, paddings and gaps between the elements are derived from.
   * @default '1rem'
   */
  spacing?: CssLengthUnit;
};

export type BaseThemeTaggedType = { __type: 'prebuilt_appearance' };
export type BaseTheme = BaseThemeTaggedType;

export type Theme = {
  /**
   * A theme used as the base theme for the components.
   * For further customisation, you can use the {@link Theme.layout}, {@link Theme.variables} and {@link Theme.elements} props.
   * @example
   * import { dark } from "@clerk/themes";
   * appearance={{ baseTheme: dark }}
   */
  baseTheme?: BaseTheme | BaseTheme[];
  /**
   * Configuration options that affect the layout of the components, allowing
   * customizations that hard to implement with just CSS.
   * Eg: placing the logo outside the card element
   */
  layout?: Layout;
  /**
   * General theme overrides. This styles will be merged with our base theme.
   * Can override global styles like colors, fonts etc.
   * Eg: `colorPrimary: 'blue'`
   */
  variables?: Variables;
  /**
   * Fine-grained theme overrides. Useful when you want to style
   * specific elements or elements that under a specific state.
   * Eg: `formButtonPrimary__loading: { backgroundColor: 'gray' }`
   */
  elements?: Elements;
  /**
   * The appearance of the CAPTCHA widget.
   * This will be used to style the CAPTCHA widget.
   * Eg: `theme: 'dark'`
   */
  captcha?: CaptchaAppearanceOptions;
};

export type Layout = {
  /**
   * Controls whether the logo will be rendered inside or outside the component card.
   * To customise the logo further, you can use {@link Appearance.elements}
   * @default inside
   */
  logoPlacement?: 'inside' | 'outside' | 'none';
  /**
   * The URL of your custom logo the components will display.
   * By default, the components will use the logo you've set in the Clerk Dashboard.
   * This option is helpful when you need to display different logos for different themes,
   * eg: white logo on dark themes, black logo on light themes
   * To customise the logo further, you can use {@link Appearance.elements}
   * @default undefined
   */
  logoImageUrl?: string;
  /**
   * Controls where the browser will redirect to after the user clicks the application logo,
   * usually found in the SignIn and SignUp components.
   * If a URL is provided, it will be used as the `href` of the link.
   * If a value is not passed in, the components will use the Home URL as set in the Clerk dashboard
   * @default undefined
   */
  logoLinkUrl?: string;
  /**
   * Controls the variant that will be used for the social buttons.
   * By default, the components will use block buttons if you have less than
   * 3 social providers enabled, otherwise icon buttons will be used.
   * To customise the social buttons further, you can use {@link Appearance.elements}
   * @default auto
   */
  socialButtonsVariant?: 'auto' | 'iconButton' | 'blockButton';
  /**
   * Controls whether the social buttons will be rendered above or below the card form.
   * To customise the social button container further, you can use {@link Appearance.elements}
   * @default 'top'
   */
  socialButtonsPlacement?: 'top' | 'bottom';
  /**
   * Controls whether the SignIn or SignUp forms will include optional fields.
   * You can make a field required or optional through the {@link https://dashboard.clerk.com|Clerk dashboard}.
   * @default true
   */
  showOptionalFields?: boolean;
  /**
   * This options enables the "Terms" link which is, by default, displayed on the bottom-right corner of the
   * prebuilt components. Clicking the link will open the passed URL in a new tab
   */
  termsPageUrl?: string;
  /**
   * This options enables the "Help" link which is, by default, displayed on the bottom-right corner of the
   * prebuilt components. Clicking the link will open the passed URL in a new tab
   */
  helpPageUrl?: string;
  /**
   * This options enables the "Privacy" link which is, by default, displayed on the bottom-right corner of the
   * prebuilt components. Clicking the link will open the passed URL in a new tab
   */
  privacyPageUrl?: string;
  /**
   * This option enables the shimmer animation for the avatars of <UserButton/> and <OrganizationSwitcher/>
   * @default true
   */
  shimmer?: boolean;
  /**
   * This option enables/disables animations for the components. If you want to disable animations, you can set this to false.
   * Also the prefers-reduced-motion media query is respected and animations are disabled if the user has set it to reduce motion regardless of this option.
   * @default true
   */
  animations?: boolean;

  /**
   * This option disables development mode warning.
   * We don't recommend disabling this unless you want to see a preview of how the components will look in production.
   * @default false
   */
  unsafe_disableDevelopmentModeWarnings?: boolean;
};

export type CaptchaAppearanceOptions = {
  /**
   * The widget theme. Can take the following values: light, dark, auto.
   * @default 'auto'
   */
  theme?: 'auto' | 'light' | 'dark';
  /**
   * The widget size. Can take the following values: normal, flexible, compact.
   * @default 'normal'
   */
  size?: 'normal' | 'flexible' | 'compact';
  /**
   * Language to display, must be either: auto (default) to use the language that the visitor has chosen, or an ISO 639-1 two-letter language code (e.g. en) or language and country code (e.g. en-US).
   * Refer to the list of supported languages for more information: https://developers.cloudflare.com/turnstile/reference/supported-languages
   */
  language?: string;
};

export type SignInTheme = Theme;
export type SignUpTheme = Theme;
export type UserButtonTheme = Theme;
export type UserProfileTheme = Theme;
export type OrganizationSwitcherTheme = Theme;
export type OrganizationListTheme = Theme;
export type OrganizationProfileTheme = Theme;
export type CreateOrganizationTheme = Theme;
export type UserVerificationTheme = Theme;
export type WaitlistTheme = Theme;
export type PricingTableTheme = Theme;
export type CheckoutTheme = Theme;
export type PlanDetailTheme = Theme;
export type SubscriptionDetailsTheme = Theme;
export type APIKeysTheme = Theme;
export type OAuthConsentTheme = Theme;

type GlobalAppearanceOptions = {
  /**
   * The name of the CSS layer for Clerk component styles.
   * This is useful for advanced CSS customization, allowing you to control the cascade and prevent style conflicts by isolating Clerk's styles within a specific layer.
   * For more information on CSS layers, see the [MDN documentation on @layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer).
   */
  cssLayerName?: string;
};

export type Appearance<T = Theme> = T &
  GlobalAppearanceOptions & {
    /**
     * Theme overrides that only apply to the `<SignIn/>` component
     */
    signIn?: T;
    /**
     * Theme overrides that only apply to the `<SignUp/>` component
     */
    signUp?: T;
    /**
     * Theme overrides that only apply to the `<UserButton/>` component
     */
    userButton?: T;
    /**
     * Theme overrides that only apply to the `<UserProfile/>` component
     */
    userProfile?: T;
    /**
     * Theme overrides that only apply to the `<UserVerification/>` component
     */
    userVerification?: T;
    /**
     * Theme overrides that only apply to the `<OrganizationSwitcher/>` component
     */
    organizationSwitcher?: T;
    /**
     * Theme overrides that only apply to the `<OrganizationList/>` component
     */
    organizationList?: T;
    /**
     * Theme overrides that only apply to the `<OrganizationProfile/>` component
     */
    organizationProfile?: T;
    /**
     * Theme overrides that only apply to the `<CreateOrganization />` component
     */
    createOrganization?: T;
    /**
     * Theme overrides that only apply to the `<CreateOrganization />` component
     */
    oneTap?: T;
    /**
     * Theme overrides that only apply to the `<Waitlist />` component
     */
    waitlist?: T;
    /**
     * Theme overrides that only apply to the `<PricingTable />` component
     */
    pricingTable?: T;
    /**
     * Theme overrides that only apply to the `<Checkout />` component
     */
    checkout?: T;
    /**
     * Theme overrides that only apply to the `<APIKeys />` component
     */
    apiKeys?: T;
    /**
     * Theme overrides that only apply to the `<OAuthConsent />` component
     */
    __internal_oauthConsent?: T;
  };
