import * as CSS from 'csstype';

import { OAuthProvider } from './oauth';
import { FontFamily } from './theme';
import { Web3Provider } from './web3';

type CSSProperties = CSS.PropertiesFallback<number | string>;
type CSSPropertiesWithMultiValues = { [K in keyof CSSProperties]: CSSProperties[K] };
type CSSPseudos = { [K in CSS.Pseudos as `&${K}`]?: CSSObject };

interface CSSObject extends CSSPropertiesWithMultiValues, CSSPseudos {}
type UserDefinedStyle = string | CSSObject;

type Shade = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
export type ColorScale<T = string> = Record<Shade, T>;
export type LightScale<T = string> = Pick<ColorScale<T>, '50' | '100' | '200' | '300' | '400' | '500'>;

export type ColorScaleWithRequiredBase<T = string> = Partial<ColorScale<T>> & { '500': T };
export type LightScaleWithRequiredBase<T = string> = Partial<LightScale<T>> & { '500': T };

export type ColorOption = string | ColorScaleWithRequiredBase;
export type LightColorOption = string | LightScaleWithRequiredBase;

export type FontSize = string | { small?: string; base: string; large?: string };
export type BorderRadius = string | { small?: string; base: string; large?: string };

type LoadingState = 'loading';
type DisabledState = 'disabled';
type ErrorState = 'error';
type OpenState = 'open';
export type ElementState = LoadingState | DisabledState | ErrorState | OpenState;

export type AlertId = 'danger' | 'warning';
export type FieldId =
  | 'firstName'
  | 'lastName'
  | 'emailAddress'
  | 'phoneNumber'
  | 'password'
  | 'identifier'
  | 'username';

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
  'socialButtons-buttonIcon': WithOptions<OAuthProvider | Web3Provider, LoadingState | DisabledState, never>;
  'socialButtons-buttonBlock': WithOptions<OAuthProvider | Web3Provider, LoadingState | DisabledState, never>;
  'socialButtons-buttonBlockText': WithOptions<OAuthProvider | Web3Provider, never, never>;
  'socialButtons-buttonBlockArrow': WithOptions<OAuthProvider | Web3Provider, never, never>;
  'socialButtons-logo': WithOptions<OAuthProvider | Web3Provider, LoadingState | DisabledState, never>;

  form: WithOptions<never, ErrorState, never>;
  'form-fieldRow': WithOptions<never, never, never>;
  'form-field': WithOptions<FieldId, ErrorState | DisabledState, never>;
  'form-fieldLabelRow': WithOptions<FieldId, ErrorState | DisabledState, never>;
  'form-fieldLabel': WithOptions<FieldId, ErrorState | DisabledState, never>;
  'form-fieldAction': WithOptions<FieldId, ErrorState | DisabledState, never>;
  'form-fieldInput': WithOptions<FieldId, ErrorState | DisabledState, never>;
  'form-fieldErrorText': WithOptions<FieldId, ErrorState | DisabledState, never>;
  'form-buttonPrimary': WithOptions<never, ErrorState | LoadingState, never>;
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
};

export type Elements = {
  [k in keyof ElementsConfig]: Selectors<ElementObjectKey<k> & string, ElementsConfig[k]>;
}[keyof ElementsConfig];

export type Variables = {
  /**
   * The primary color used throughout the components. Set this to your brand color.
   */
  colorPrimary?: ColorOption;
  /**
   * The color used to indicate errors or destructive actions. Set this to your brand's danger color.
   */
  colorDanger?: ColorOption;
  /**
   * The color used to indicate an action that completed successfully or a positive result.
   */
  colorSuccess?: ColorOption;
  /**
   * The color used for potentially destructive actions or when the user's attention is required.
   */
  colorWarning?: ColorOption;
  /**
   * The default text color. The 500 shade is used as the text base. Less important
   * text (eg: a subtitle) will use lighter shades.
   */
  colorText?: LightColorOption;
  /**
   * The default text color inside input elements. To customise the input background color, use`colorInputBackground`.
   */
  colorInputText?: LightColorOption;
  /**
   * The background color for the card container.
   */
  colorBackground?: string;
  /**
   * The background color for all the input elements.
   */
  colorInputBackground?: string;
  /**
   * The default font that will be used in all components.
   */
  fontFamily?: FontFamily;
  /**
   * The size that will be used as the base to calculate the `small` and `large` font sizes
   */
  fontSize?: FontSize;
  /**
   * The size that will be used as the base to calculate the `small` and `large` border sizes
   */
  borderRadius?: BorderRadius;
};

export type Theme = {
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

export type Appearance = Theme & {
  /**
   * Theme overrides that apply only
   * to the `<SignIn/>` component
   */
  signIn?: Theme;
  /**
   * Theme overrides that apply only
   * to the `<SignUp/>` component
   */
  signUp?: Theme;
  /**
   * Theme overrides that apply only
   * to the `<UserButton/>` component
   */
  userButton?: Theme;
  /**
   * Theme overrides that apply only
   * to the `<UserProfile/>` component
   */
  userProfile?: Theme;
};

// TODO: Discuss if we want to release a `prefersColorScheme` based theme switcher
// type AppearanceFunctionParams = { prefersColorScheme: 'dark' | 'light' };
// export type AppearanceFactory = (params: AppearanceFunctionParams) => Appearance;
// export type AppearanceProp = Appearance | AppearanceFactory;
