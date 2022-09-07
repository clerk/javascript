import * as CSS from 'csstype';

import { OAuthProvider } from './oauth';
import { BuiltInColors, TransparentColor } from './theme';
import { Web3Provider } from './web3';

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

export type AlertId = 'danger' | 'warning';
export type FieldId =
  | 'firstName'
  | 'lastName'
  | 'emailAddress'
  | 'phoneNumber'
  | 'password'
  | 'confirmPassword'
  | 'identifier'
  | 'username';
export type ProfileSectionId =
  | 'profile'
  | 'username'
  | 'emailAddresses'
  | 'phoneNumbers'
  | 'connectedAccounts'
  | 'web3Wallets'
  | 'password'
  | 'mfa'
  | 'activeDevices';
export type ProfilePageId = 'account' | 'security';

type NavbarItemId = 'account' | 'security';

/**
 * A type that describes the states and the ids that we will combine
 * in order to create all theming combinations
 * If jsx exists, the element can also receive a typed function that returns a JSX.Element
 */
type ConfigOptions = { states: ElementState; ids: string; jsx: any };
type WithOptions<Ids, States, Jsx> = { ids: Ids; states: States; jsx: Jsx };

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
  rootBox: WithOptions<never, never, never>;
  card: WithOptions<never, never, never>;

  logoBox: WithOptions<never, never, never>;
  logoImage: WithOptions<never, never, never>;
  // outerLogo: WithOptions<never, never, never>;
  // 'outerLogo-image': WithOptions<never, never, never>;

  header: WithOptions<never, never, never>;
  headerTitle: WithOptions<never, never, never>;
  headerSubtitle: WithOptions<never, never, never>;
  headerBackRow: WithOptions<never, never, never>;
  headerBackLink: WithOptions<never, never, never>;
  headerBackIcon: WithOptions<never, never, never>;

  main: WithOptions<never, never, never>;

  footer: WithOptions<never, never, never>;
  footerAction: WithOptions<never, never, never>;
  footerActionText: WithOptions<never, never, never>;
  footerActionLink: WithOptions<never, never, never>;
  footerPages: WithOptions<never, never, never>;
  footerPagesLink: WithOptions<'help' | 'terms' | 'privacy', never, never>;

  socialButtons: WithOptions<never, never, never>;
  socialButtonsIconButton: WithOptions<OAuthProvider | Web3Provider, LoadingState, never>;
  socialButtonsBlockButton: WithOptions<OAuthProvider | Web3Provider, LoadingState, never>;
  socialButtonsBlockButtonText: WithOptions<OAuthProvider | Web3Provider, never, never>;
  socialButtonsBlockButtonArrow: WithOptions<OAuthProvider | Web3Provider, never, never>;
  socialButtonsProviderIcon: WithOptions<OAuthProvider | Web3Provider, LoadingState, never>;

  alternativeMethods: WithOptions<never, never, never>;
  alternativeMethodsBlockButton: WithOptions<OAuthProvider | Web3Provider, LoadingState, never>;
  alternativeMethodsBlockButtonText: WithOptions<OAuthProvider | Web3Provider, never, never>;
  alternativeMethodsBlockButtonArrow: WithOptions<OAuthProvider | Web3Provider, never, never>;

  otpCodeBox: WithOptions<never, never, never>;
  otpCodeHeader: WithOptions<never, never, never>;
  otpCodeHeaderTitle: WithOptions<never, never, never>;
  otpCodeHeaderSubtitle: WithOptions<never, never, never>;
  otpCodeField: WithOptions<never, never, never>;
  otpCodeFieldInputs: WithOptions<never, never, never>;
  otpCodeFieldInput: WithOptions<never, never, never>;
  otpCodeFieldErrorText: WithOptions<never, never, never>;

  dividerRow: WithOptions<never, never, never>;
  dividerText: WithOptions<never, never, never>;
  dividerLine: WithOptions<never, never, never>;

  formHeader: WithOptions<never, ErrorState, never>;
  formHeaderTitle: WithOptions<never, ErrorState, never>;
  formHeaderSubtitle: WithOptions<never, ErrorState, never>;
  formResendCodeLink: WithOptions<never, never, never>;

  verificationLinkStatusBox: WithOptions<never, never, never>;
  verificationLinkStatusIconBox: WithOptions<never, never, never>;
  verificationLinkStatusIcon: WithOptions<never, never, never>;
  verificationLinkStatusText: WithOptions<never, never, never>;

  form: WithOptions<never, ErrorState, never>;
  formFieldRow: WithOptions<never, never, never>;
  formField: WithOptions<FieldId, ControlState, never>;
  formFieldLabelRow: WithOptions<FieldId, ControlState, never>;
  formFieldLabel: WithOptions<FieldId, ControlState, never>;
  formFieldAction: WithOptions<FieldId, ControlState, never>;
  formFieldInput: WithOptions<FieldId, ControlState, never>;
  formFieldErrorText: WithOptions<FieldId, ControlState, never>;
  formFieldHintText: WithOptions<FieldId, ControlState, never>;
  formButtonRow: WithOptions<never, ControlState | LoadingState, never>;
  formButtonPrimary: WithOptions<never, ControlState | LoadingState, never>;
  formButtonReset: WithOptions<never, ControlState | LoadingState, never>;
  formFieldInputGroup: WithOptions<never, never, never>;
  formFieldInputShowPasswordButton: WithOptions<never, never, never>;
  formFieldInputShowPasswordIcon: WithOptions<never, never, never>;
  formFieldInputCopyToClipboardButton: WithOptions<never, never, never>;
  formFieldInputCopyToClipboardIcon: WithOptions<never, never, never>;

  avatar: WithOptions<never, never, never>;
  avatarImage: WithOptions<never, never, never>;

  // TODO: We can remove "Popover" from these:
  userButtonBox: WithOptions<never, 'open', never>;
  userButtonOuterIdentifier: WithOptions<never, 'open', never>;
  userButtonTrigger: WithOptions<never, 'open', never>;
  userButtonAvatarBox: WithOptions<never, 'open', never>;
  userButtonAvatarImage: WithOptions<never, 'open', never>;
  userButtonPopoverRootBox: WithOptions<never, never, never>;
  userButtonPopoverCard: WithOptions<never, never, never>;
  userButtonPopoverMain: WithOptions<never, never, never>;
  userButtonPopoverUserPreview: WithOptions<never, never, never>;
  userButtonPopoverActions: WithOptions<never, never, never>;
  userButtonPopoverActionButton: WithOptions<'manageAccount' | 'signOut', never, never>;
  userButtonPopoverActionButtonIconBox: WithOptions<'manageAccount' | 'signOut', never, never>;
  userButtonPopoverActionButtonIcon: WithOptions<'manageAccount' | 'signOut', never, never>;
  userButtonPopoverActionButtonText: WithOptions<'manageAccount' | 'signOut', never, never>;
  userButtonPopoverFooter: WithOptions<never, never, never>;
  userButtonPopoverFooterPages: WithOptions<never, never, never>;
  userButtonPopoverFooterPagesLink: WithOptions<'terms' | 'privacy', never, never>;

  // TODO: Test this idea. Instead of userButtonUserPreview, have a userPreview__userButton instead
  // Same for other repeated selectors, eg avatar
  userPreview: WithOptions<'userButton', never, never>;
  userPreviewAvatarContainer: WithOptions<'userButton', never, never>;
  userPreviewAvatarBox: WithOptions<'userButton', never, never>;
  userPreviewAvatarImage: WithOptions<'userButton', never, never>;
  userPreviewTextContainer: WithOptions<'userButton', never, never>;
  userPreviewMainIdentifier: WithOptions<'userButton', never, never>;
  userPreviewSecondaryIdentifier: WithOptions<'userButton', never, never>;

  identityPreview: WithOptions<never, never, never>;
  identityPreviewAvatarBox: WithOptions<never, never, never>;
  identityPreviewAvatarImage: WithOptions<never, never, never>;
  identityPreviewText: WithOptions<never, never, never>;
  identityPreviewEditButton: WithOptions<never, never, never>;
  identityPreviewEditButtonIcon: WithOptions<never, never, never>;

  alert: WithOptions<AlertId, never, never>;
  alertIcon: WithOptions<AlertId, never, never>;
  alertText: WithOptions<AlertId, never, never>;

  loader: WithOptions<never, never, never>;
  loaderIcon: WithOptions<never, ErrorState, never>;

  modalBackdrop: WithOptions<never, never, never>;
  modalContent: WithOptions<never, never, never>;

  profileSection: WithOptions<ProfileSectionId, never, never>;
  profileSectionTitle: WithOptions<ProfileSectionId, never, never>;
  profileSectionTitleText: WithOptions<ProfileSectionId, never, never>;
  profileSectionContent: WithOptions<ProfileSectionId, never, never>;
  profileSectionPrimaryButton: WithOptions<ProfileSectionId, never, never>;
  profilePage: WithOptions<ProfilePageId, never, never>;

  // TODO: review
  formattedPhoneNumber: WithOptions<never, never, never>;
  formattedPhoneNumberFlag: WithOptions<never, never, never>;
  formattedPhoneNumberText: WithOptions<never, never, never>;

  breadcrumbs: WithOptions<never, never, never>;
  breadcrumbsItems: WithOptions<never, never, never>;
  breadcrumbsItemBox: WithOptions<'currentPage', never, never>;
  breadcrumbsItem: WithOptions<'currentPage', never, never>;
  breadcrumbsItemIcon: WithOptions<'currentPage', never, never>;
  breadcrumbsItemDivider: WithOptions<never, never, never>;

  scrollBox: WithOptions<never, never, never>;

  navbar: WithOptions<never, never, never>;
  navbarButtons: WithOptions<never, ActiveState, never>;
  navbarButton: WithOptions<NavbarItemId, ActiveState, never>;
  navbarButtonIcon: WithOptions<NavbarItemId, ActiveState, never>;
  navbarMobileMenuRow: WithOptions<never, never, never>;
  navbarMobileMenuButton: WithOptions<never, never, never>;
  navbarMobileMenuButtonIcon: WithOptions<never, never, never>;

  pageScrollBox: WithOptions<never, never, never>;
  page: WithOptions<never, never, never>;
  pageHeader: WithOptions<never, never, never>;

  activeDeviceIcon: WithOptions<'mobile' | 'desktop', never, never>;

  fileDropAreaOuterBox: WithOptions<never, never, never>;
  fileDropAreaBox: WithOptions<never, never, never>;
  fileDropAreaIconBox: WithOptions<never, never, never>;
  fileDropAreaIcon: WithOptions<never, never, never>;
  fileDropAreaHint: WithOptions<never, never, never>;
  fileDropAreaButtonPrimary: WithOptions<never, never, never>;
  fileDropAreaFooterHint: WithOptions<never, never, never>;

  accordionTriggerButton: WithOptions<never, never, never>;
  accordionContent: WithOptions<never, never, never>;

  // default descriptors
  badge: WithOptions<'primary' | 'actionRequired', never, never>;
  button: WithOptions<never, LoadingState, never>;
  providerIcon: WithOptions<OAuthProvider | Web3Provider, never, never>;
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
   * You can make a field required or optional through the {@link https://dashboard.clerk.dev|Clerk dashboard}.
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
};

export type SignInTheme = Theme;
export type SignUpTheme = Theme;
export type UserButtonTheme = Theme;
export type UserProfileTheme = Theme;

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
};
