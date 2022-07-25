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
type FontWeight = 400 | 500 | 600;
type FontWeightScale = { normal?: FontWeight; medium?: FontWeight; bold?: FontWeight };

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
  root: WithOptions<never, never, never>;
  card: WithOptions<never, never, never>;

  logo: WithOptions<never, never, never>;
  'logo-image': WithOptions<never, never, never>;
  // outerLogo: WithOptions<never, never, never>;
  // 'outerLogo-image': WithOptions<never, never, never>;

  header: WithOptions<never, never, never>;
  'header-title': WithOptions<never, never, never>;
  'header-subtitle': WithOptions<never, never, never>;

  main: WithOptions<never, never, never>;

  footer: WithOptions<never, never, never>;
  'footer-action': WithOptions<never, never, never>;
  'footer-actionText': WithOptions<never, never, never>;
  'footer-actionLink': WithOptions<never, never, never>;
  'footer-pages': WithOptions<never, never, never>;
  'footer-pagesLink': WithOptions<'help' | 'terms' | 'privacy', never, never>;

  // TODO: grid + rows or just socialButtons?
  // socialButtonsGrid: WithOptions<never, never, never>;
  // socialButtonsRows: WithOptions<never, never, never>;
  socialButtons: WithOptions<never, never, never>;
  'socialButtons-buttonIcon': WithOptions<OAuthProvider | Web3Provider, LoadingState, never>;
  'socialButtons-buttonBlock': WithOptions<OAuthProvider | Web3Provider, LoadingState, never>;
  'socialButtons-buttonBlockText': WithOptions<OAuthProvider | Web3Provider, never, never>;
  'socialButtons-buttonBlockArrow': WithOptions<OAuthProvider | Web3Provider, never, never>;
  'socialButtons-logo': WithOptions<OAuthProvider | Web3Provider, LoadingState, never>;

  dividerBox: WithOptions<never, never, never>;
  dividerText: WithOptions<never, never, never>;
  dividerLine: WithOptions<never, never, never>;

  form: WithOptions<never, ErrorState, never>;
  'form-fieldRow': WithOptions<never, never, never>;
  'form-field': WithOptions<FieldId, ControlState, never>;
  'form-fieldLabelRow': WithOptions<FieldId, ControlState, never>;
  'form-fieldLabel': WithOptions<FieldId, ControlState, never>;
  'form-fieldAction': WithOptions<FieldId, ControlState, never>;
  'form-fieldInput': WithOptions<FieldId, ControlState, never>;
  'form-fieldErrorText': WithOptions<FieldId, ControlState, never>;
  'form-fieldHintText': WithOptions<FieldId, ControlState, never>;
  'form-buttonPrimary': WithOptions<never, ControlState | LoadingState, never>;
  'form-buttonReset': WithOptions<never, ControlState | LoadingState, never>;
  'form-fieldInputShowPassword': WithOptions<never, never, never>;
  'form-fieldInputShowPasswordIcon': WithOptions<never, never, never>;

  avatar: WithOptions<never, never, never>;
  'avatar-image': WithOptions<never, never, never>;

  userButton: WithOptions<never, 'open', never>;
  'userButton-trigger': WithOptions<never, 'open', never>;
  'userButton-popover': WithOptions<never, never, never>;

  identityPreview: WithOptions<never, never, never>;
  'identityPreview-avatar': WithOptions<never, never, never>;
  'identityPreview-text': WithOptions<never, never, never>;
  'identityPreview-icon': WithOptions<never, never, never>;

  alert: WithOptions<AlertId, never, never>;
  'alert-icon': WithOptions<AlertId, never, never>;
  'alert-text': WithOptions<AlertId, never, never>;

  loader: WithOptions<never, never, never>;
  'loader-icon': WithOptions<never, ErrorState, never>;

  'modal-backdrop': WithOptions<never, never, never>;
  'modal-content': WithOptions<never, never, never>;

  profileSection: WithOptions<ProfileSectionId, never, never>;
  'profileSection-title': WithOptions<ProfileSectionId, never, never>;
  'profileSection-titleText': WithOptions<ProfileSectionId, never, never>;
  'profileSection-content': WithOptions<ProfileSectionId, never, never>;

  // TODO: review
  formattedPhoneNumber: WithOptions<never, never, never>;
  'formattedPhoneNumber-flag': WithOptions<never, never, never>;
  'formattedPhoneNumber-text': WithOptions<never, never, never>;

  breadcrumbs: WithOptions<never, never, never>;
  'breadcrumbs-itemContainer': WithOptions<never, never, never>;
  'breadcrumbs-icon': WithOptions<never, never, never>;
  'breadcrumbs-item': WithOptions<'currentPage', never, never>;
  'breadcrumbs-divider': WithOptions<never, never, never>;

  scroller: WithOptions<never, never, never>;

  navbarSection: WithOptions<never, never, never>;
  navbar: WithOptions<never, ActiveState, never>;
  'navbar-item': WithOptions<NavbarItemId, ActiveState, never>;
  'navbar-icon': WithOptions<NavbarItemId, ActiveState, never>;

  pageSection: WithOptions<never, never, never>;
  page: WithOptions<never, never, never>;
  pageHeader: WithOptions<never, never, never>;

  activeDeviceIcon: WithOptions<'mobile' | 'desktop', never, never>;
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
   * Hello there how are you
   */
  baseTheme?: BaseTheme;
  /**
   * Configuration options that affect the layout of the components, allowing
   * customizations that hard to implement with CSS.
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
   * 4 social providers enabled, otherwise icon buttons will be used.
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
};

export type SignInTheme = Theme;
export type SignUpTheme = Theme;
export type UserButtonTheme = Theme;
export type UserProfileTheme = Theme;

export type Appearance = Theme & {
  /**
   * Theme overrides that only apply to the `<SignIn/>` component
   */
  signIn?: SignInTheme;
  /**
   * Theme overrides that only apply to the `<SignUp/>` component
   */
  signUp?: SignUpTheme;
  /**
   * Theme overrides that only apply to the `<UserButton/>` component
   */
  userButton?: UserButtonTheme;
  /**
   * Theme overrides that only apply to the `<UserProfile/>` component
   */
  userProfile?: UserProfileTheme;
};

// TODO: Remove before GA
export const createClerkTheme = (appearance: Omit<Appearance, 'baseTheme'>): BaseTheme => {
  // Placeholder method that might hande more transformations in the future
  return { ...appearance, __type: 'prebuilt_appearance' };
};

// TODO: Remove before GA
export const darkGlass = createClerkTheme({
  variables: {
    colorAlphaShade: 'white',
    colorText: 'white',
    colorBackground: 'rgba(43,43,56,0.95)',
    colorInputText: 'white',
    colorInputBackground: 'rgba(255,255,255,0.1)',
    colorPrimary: 'rgb(0,172,255)',
    colorDanger: 'rgb(255,125,142)',
    colorSuccess: 'rgb(19,255,128)',
    fontSmoothing: 'auto',
  },
  elements: {
    card: {
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(15px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    socialButtonsLogo__apple: { filter: 'invert(1)' },
    socialButtonsLogo__github: { filter: 'invert(1)' },
    activeDeviceIcon: {
      '--cl-chassis-bottom': '#d2d2d2',
      '--cl-chassis-back': '#e6e6e6',
      '--cl-chassis-screen': '#e6e6e6',
      '--cl-screen': '#111111',
    },
  },
});

export const dark = createClerkTheme({
  variables: {
    colorAlphaShade: 'white',
    colorText: 'white',
    colorBackground: 'rgba(43,43,56)',
    colorInputText: 'white',
    colorInputBackground: 'rgba(255,255,255,0.1)',
  },
  elements: {
    card: {
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    socialButtonsLogo__apple: { filter: 'invert(1)' },
    socialButtonsLogo__github: { filter: 'invert(1)' },
    activeDeviceIcon: {
      '--cl-chassis-bottom': '#d2d2d2',
      '--cl-chassis-back': '#e6e6e6',
      '--cl-chassis-screen': '#e6e6e6',
      '--cl-screen': '#111111',
    },
  },
});
