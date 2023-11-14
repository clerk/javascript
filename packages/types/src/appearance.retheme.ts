import type * as CSS from 'csstype';

import type {
  AlertId,
  FieldId,
  FooterActionId,
  MenuId,
  OrganizationPreviewId,
  ProfilePageId,
  ProfileSectionId,
  SelectId,
  UserPreviewId,
} from './elementIds';
import type { OAuthProvider } from './oauth';
import type { SamlIdpSlug } from './saml';
import type { BuiltInColors, TransparentColor } from './theme';
import type { Web3Provider } from './web3';

type CSSProperties = CSS.PropertiesFallback<number | string>;
type CSSPropertiesWithMultiValues = { [K in keyof CSSProperties]: CSSProperties[K] };
type CSSPseudos = { [K in CSS.Pseudos as `&${K}`]?: CSSObject };

interface CSSObject extends CSSPropertiesWithMultiValues, CSSPseudos {}

type UserDefinedStyle = string | CSSObject;

type Shade = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
export type ColorScale<T = string> = Record<Shade, T>;
export type AlphaColorScale<T = string> = Record<'20' | Shade, T>;

export type ColorScaleWithRequiredBase<T = string> = Partial<ColorScale<T>> & { '500': T };

export type CssColorOrScale = string | ColorScaleWithRequiredBase;
export type CssColorOrAlphaScale = string | AlphaColorScale;
type CssColor = string | TransparentColor | BuiltInColors;
type CssLengthUnit = string;
type FontSmoothing = 'auto' | 'antialiased' | 'never';

type FontWeightNamedValue = CSS.Properties['fontWeight'];
type FontWeightNumericValue = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

type FontWeightScale = {
  normal?: FontWeightNamedValue | FontWeightNumericValue;
  medium?: FontWeightNamedValue | FontWeightNumericValue;
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
  rootBox: WithOptions;
  card: WithOptions;
  cardContent: WithOptions;
  cardFooter: WithOptions;
  cardFooterItem: WithOptions;

  logoBox: WithOptions;
  logoImage: WithOptions;
  // outerLogo: WithOptions;
  // 'outerLogo-image': WithOptions;

  header: WithOptions;
  headerTitle: WithOptions;
  headerSubtitle: WithOptions;
  headerBackRow: WithOptions;
  headerBackLink: WithOptions;
  headerBackIcon: WithOptions;

  main: WithOptions;

  footer: WithOptions;
  footerAction: WithOptions<FooterActionId>;
  footerActionText: WithOptions;
  footerActionLink: WithOptions;
  footerPages: WithOptions;
  footerPagesLink: WithOptions<'help' | 'terms' | 'privacy'>;

  socialButtons: WithOptions;
  socialButtonsIconButton: WithOptions<OAuthProvider | Web3Provider, LoadingState>;
  socialButtonsBlockButton: WithOptions<OAuthProvider | Web3Provider, LoadingState>;
  socialButtonsBlockButtonText: WithOptions<OAuthProvider | Web3Provider>;
  socialButtonsBlockButtonArrow: WithOptions<OAuthProvider | Web3Provider>;
  socialButtonsProviderIcon: WithOptions<OAuthProvider | Web3Provider, LoadingState>;

  enterpriseButtonsProviderIcon: WithOptions<SamlIdpSlug, LoadingState>;

  alternativeMethods: WithOptions;
  alternativeMethodsBlockButton: WithOptions<OAuthProvider | Web3Provider, LoadingState>;
  alternativeMethodsBlockButtonText: WithOptions<OAuthProvider | Web3Provider>;
  alternativeMethodsBlockButtonArrow: WithOptions<OAuthProvider | Web3Provider>;

  otpCodeBox: WithOptions;
  otpCodeHeader: WithOptions;
  otpCodeHeaderTitle: WithOptions;
  otpCodeHeaderSubtitle: WithOptions;
  otpCodeField: WithOptions;
  otpCodeFieldInputs: WithOptions;
  otpCodeFieldInput: WithOptions;
  otpCodeFieldErrorText: WithOptions;

  dividerRow: WithOptions;
  dividerText: WithOptions;
  dividerLine: WithOptions;

  formHeader: WithOptions<never, ErrorState>;
  formHeaderTitle: WithOptions<never, ErrorState>;
  formHeaderSubtitle: WithOptions<never, ErrorState>;
  formResendCodeLink: WithOptions;

  verificationLinkStatusBox: WithOptions;
  verificationLinkStatusIconBox: WithOptions;
  verificationLinkStatusIcon: WithOptions;
  verificationLinkStatusText: WithOptions;

  form: WithOptions<never, ErrorState>;
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
  formFieldAction: WithOptions<FieldId, ControlState>;
  formFieldInput: WithOptions<FieldId, ControlState>;
  formFieldErrorText: WithOptions<FieldId, ControlState>;
  formFieldWarningText: WithOptions<FieldId, ControlState>;
  formFieldSuccessText: WithOptions<FieldId, ControlState>;
  formFieldInfoText: WithOptions<FieldId, ControlState>;
  formFieldDirectionsText: WithOptions<FieldId, ControlState>;
  formFieldHintText: WithOptions<FieldId, ControlState>;
  formButtonRow: WithOptions<never, ControlState | LoadingState>;
  formButtonPrimary: WithOptions<never, ControlState | LoadingState>;
  formButtonReset: WithOptions<never, ControlState | LoadingState>;
  formFieldInputGroup: WithOptions;
  formFieldInputShowPasswordButton: WithOptions;
  formFieldInputShowPasswordIcon: WithOptions;
  formFieldInputCopyToClipboardButton: WithOptions;
  formFieldInputCopyToClipboardIcon: WithOptions;

  phoneInputBox: WithOptions<never, ControlState>;
  formInputGroup: WithOptions<never, ControlState>;

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
  userButtonPopoverUserPreview: WithOptions;
  userButtonPopoverActions: WithOptions;
  userButtonPopoverActionButton: WithOptions<'manageAccount' | 'signOut'>;
  userButtonPopoverActionButtonIconBox: WithOptions<'manageAccount' | 'signOut'>;
  userButtonPopoverActionButtonIcon: WithOptions<'manageAccount' | 'signOut'>;
  userButtonPopoverActionButtonText: WithOptions<'manageAccount' | 'signOut'>;
  userButtonPopoverFooter: WithOptions;
  userButtonPopoverFooterPages: WithOptions;
  userButtonPopoverFooterPagesLink: WithOptions<'terms' | 'privacy'>;

  organizationSwitcherTrigger: WithOptions<never, 'open'>;
  organizationSwitcherTriggerIcon: WithOptions<never, 'open'>;
  organizationSwitcherPopoverRootBox: WithOptions;
  organizationSwitcherPopoverCard: WithOptions;
  organizationSwitcherPopoverMain: WithOptions;
  organizationSwitcherPopoverActions: WithOptions;
  organizationSwitcherPopoverInvitationActions: WithOptions;
  organizationSwitcherPopoverActionButton: WithOptions<
    'manageOrganization' | 'createOrganization' | 'switchOrganization',
    never,
    never
  >;
  organizationSwitcherPreviewButton: WithOptions;
  organizationSwitcherInvitationAcceptButton: WithOptions;
  organizationSwitcherInvitationRejectButton: WithOptions;
  organizationSwitcherPopoverActionButtonIconBox: WithOptions<
    'manageOrganization' | 'createOrganization',
    never,
    never
  >;
  organizationSwitcherPopoverActionButtonIcon: WithOptions<'manageOrganization' | 'createOrganization'>;
  organizationSwitcherPopoverActionButtonText: WithOptions<'manageOrganization' | 'createOrganization'>;
  organizationSwitcherPopoverFooter: WithOptions;
  organizationSwitcherPopoverFooterPages: WithOptions;
  organizationSwitcherPopoverFooterPagesLink: WithOptions<'terms' | 'privacy'>;

  organizationListPreviewItems: WithOptions;
  organizationListPreviewItem: WithOptions;
  organizationListPreviewButton: WithOptions;
  organizationListPreviewItemActionButton: WithOptions;

  // TODO: Test this idea. Instead of userButtonUserPreview, have a userPreview__userButton instead
  // Same for other repeated selectors, eg avatar
  userPreview: WithOptions<UserPreviewId>;
  userPreviewAvatarContainer: WithOptions<UserPreviewId>;
  userPreviewAvatarBox: WithOptions<UserPreviewId>;
  userPreviewAvatarImage: WithOptions<UserPreviewId>;
  userPreviewTextContainer: WithOptions<UserPreviewId>;
  userPreviewMainIdentifier: WithOptions<UserPreviewId>;
  userPreviewSecondaryIdentifier: WithOptions<UserPreviewId>;

  organizationPreview: WithOptions<OrganizationPreviewId>;
  organizationPreviewAvatarContainer: WithOptions<OrganizationPreviewId>;
  organizationPreviewAvatarBox: WithOptions<OrganizationPreviewId>;
  organizationPreviewAvatarImage: WithOptions<OrganizationPreviewId>;
  organizationPreviewTextContainer: WithOptions<OrganizationPreviewId>;
  organizationPreviewMainIdentifier: WithOptions<OrganizationPreviewId>;
  organizationPreviewSecondaryIdentifier: WithOptions<OrganizationPreviewId>;

  membersPageInviteButton: WithOptions;
  organizationProfilePage: WithOptions;

  identityPreview: WithOptions;
  identityPreviewAvatarBox: WithOptions;
  identityPreviewAvatarImage: WithOptions;
  identityPreviewText: WithOptions;
  identityPreviewEditButton: WithOptions;
  identityPreviewEditButtonIcon: WithOptions;

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

  paginationButton: WithOptions;
  paginationRowText: WithOptions<'allRowsCount' | 'rowsCount' | 'displaying'>;

  selectButton: WithOptions<SelectId>;
  selectSearchInput: WithOptions<SelectId>;
  selectButtonIcon: WithOptions<SelectId>;
  selectOptionsContainer: WithOptions<SelectId>;
  selectOption: WithOptions<SelectId>;

  menuButton: WithOptions<MenuId>;
  menuList: WithOptions<MenuId>;
  menuItem: WithOptions<MenuId>;

  loader: WithOptions;
  loaderIcon: WithOptions<never, ErrorState>;

  modalBackdrop: WithOptions;
  modalContent: WithOptions;
  modalCloseButton: WithOptions;

  profileSection: WithOptions<ProfileSectionId>;
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

  breadcrumbs: WithOptions;
  breadcrumbsItems: WithOptions;
  breadcrumbsItemBox: WithOptions<'currentPage'>;
  breadcrumbsItem: WithOptions<'currentPage'>;
  breadcrumbsItemIcon: WithOptions<'currentPage'>;
  breadcrumbsItemDivider: WithOptions;

  scrollBox: WithOptions;

  navbar: WithOptions;
  navbarButtons: WithOptions<never, ActiveState>;
  navbarButton: WithOptions<string, ActiveState>;
  navbarButtonIcon: WithOptions<string, ActiveState>;
  navbarMobileMenuRow: WithOptions;
  navbarMobileMenuButton: WithOptions;
  navbarMobileMenuButtonIcon: WithOptions;

  pageScrollBox: WithOptions;
  page: WithOptions;
  pageHeader: WithOptions;

  activeDevice: WithOptions<'current'>;
  activeDeviceListItem: WithOptions<'current'>;
  activeDeviceIcon: WithOptions<'mobile' | 'desktop'>;

  impersonationFab: WithOptions;
  impersonationFabIcon: WithOptions;
  impersonationFabIconContainer: WithOptions;
  impersonationFabTitle: WithOptions;
  impersonationFabActionLink: WithOptions;

  fileDropAreaOuterBox: WithOptions;
  fileDropAreaBox: WithOptions;
  fileDropAreaIconBox: WithOptions;
  fileDropAreaIcon: WithOptions;
  fileDropAreaHint: WithOptions;
  fileDropAreaButtonPrimary: WithOptions;
  fileDropAreaFooterHint: WithOptions;

  invitationsSentIconBox: WithOptions;
  invitationsSentIcon: WithOptions;

  accordionTriggerButton: WithOptions;
  accordionContent: WithOptions;

  qrCodeRow: WithOptions;
  qrCodeContainer: WithOptions;

  // default descriptors
  badge: WithOptions<'primary' | 'actionRequired'>;
  notificationBadge: WithOptions;
  button: WithOptions<never, LoadingState>;
  providerIcon: WithOptions<OAuthProvider | Web3Provider>;
};

export type Elements = {
  [k in keyof ElementsConfig]: Selectors<ElementObjectKey<k> & string, ElementsConfig[k]>;
}[keyof ElementsConfig];

export type Variables = {
  /**
   * The primary color used throughout the components. Set this to your brand color.
   */
  colorPrimary?: CssColorOrScale;
  /**
   * The color used to indicate errors or destructive actions. Set this to your brand's danger color.
   */
  colorDanger?: CssColorOrScale;
  /**
   * The color used to indicate an action that completed successfully or a positive result.
   */
  colorSuccess?: CssColorOrScale;
  /**
   * The color used for potentially destructive actions or when the user's attention is required.
   */
  colorWarning?: CssColorOrScale;
  /**
   * The color that will be used for all to generate the alpha shades the components use. To achieve sufficient contrast,
   * light themes should be using dark shades (`black`), while dark themes should be using light (`white`) shades. This option applies to borders,
   * backgrounds for hovered elements, hovered dropdown options etc.
   * @default 'black'
   */
  colorAlphaShade?: CssColorOrAlphaScale;
  /**
   * The default text color.
   * @default black
   */
  colorText?: CssColor;
  /**
   * The color of text appearing on top of an element that with a background color of {@link Variables.colorPrimary},
   * eg: solid primary buttons.
   * @default white
   */
  colorTextOnPrimaryBackground?: CssColor;
  /**
   * The text color for elements of lower importance, eg: a subtitle text.
   * @default A lighter shade of {@link Variables.colorText}
   */
  colorTextSecondary?: CssColor;
  /**
   * The background color for the card container.
   */
  colorBackground?: CssColor;
  /**
   * The default text color inside input elements. To customise the input background color instead, use {@link Variables.colorInputBackground}.
   * @default The value of {@link Variables.colorText}
   */
  colorInputText?: CssColor;
  /**
   * The background color for all input elements.
   */
  colorInputBackground?: CssColor;
  /**
   * The default font that will be used in all components.
   * This can be the name of a custom font loaded by your code or the name of a web-safe font ((@link WebSafeFont})
   * If a specific fontFamily is not provided, the components will inherit the font of the parent element.
   * @default inherit
   * @example
   * { fontFamily: 'Montserrat' }
   */
  fontFamily?: FontFamily;
  /**
   * The default font that will be used in all buttons. See {@link Variables.fontFamily} for details.
   * If not provided, {@link Variables.fontFamily} will be used instead.
   * @default inherit
   */
  fontFamilyButtons?: FontFamily;
  /**
   * The value will be used as the base `md` to calculate all the other scale values (`2xs`, `xs`, `sm`, `lg` and `xl`).
   * By default, this value is relative to the root fontSize of the html element.
   * @default 1rem;
   */
  fontSize?: CssLengthUnit;
  /**
   * What text anti-aliasing strategy the components will use by default. You can set it to `auto`, `antialiased` or `never`
   * @default auto;
   */
  fontSmoothing?: FontSmoothing;
  /**
   * The font weight the components will use. By default, the components will use the 400, 500 and 600 weights for normal, medium and bold
   * text respectively. You can override the default weights by passing a {@FontWeightScale} object
   * @default { normal: 400, medium: 500, bold: 600 };
   */
  fontWeight?: FontWeightScale;
  /**
   * The size that will be used as the `md` base borderRadius value. This is used as the base to calculate the `lg`, `xl`, `2xl`
   * our components use. As a general rule, the bigger an element is, the larger its borderRadius is going to be.
   * eg: the Card element uses '2xl'
   * @default 0.375rem
   */
  borderRadius?: CssLengthUnit;
  /**
   * The base spacing unit that all margins, paddings and gaps between the elements are derived from.
   * @default 1rem
   */
  spacingUnit?: CssLengthUnit;
  /**
   * The color of the avatar shimmer
   * @default rgba(255, 255, 255, 0.36)
   */
  colorShimmer?: CssColor;
  /**
   * The shadow that appears on the avatar when hovered
   * @default rgba(0, 0, 0, 0.36)
   */
  shadowShimmer?: CssColor;
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
  baseTheme?: BaseTheme;
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
};

export type SignInTheme = Theme;
export type SignUpTheme = Theme;
export type UserButtonTheme = Theme;
export type UserProfileTheme = Theme;
export type OrganizationSwitcherTheme = Theme;
export type OrganizationListTheme = Theme;
export type OrganizationProfileTheme = Theme;
export type CreateOrganizationTheme = Theme;

export type Appearance<T = Theme> = T & {
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
};
