import * as CSS from 'csstype';

import { OAuthProvider } from './oauth';

type CSSProperties = CSS.PropertiesFallback<number | string>;
type CSSPropertiesWithMultiValues = { [K in keyof CSSProperties]: CSSProperties[K] };
type CSSPseudos = { [K in CSS.Pseudos as `&${K}`]?: CSSObject };

interface CSSObject extends CSSPropertiesWithMultiValues, CSSPseudos {}
type UserDefinedStyle = string | CSSObject;
type ColorScale = Partial<Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>>;
type ColorOption = string | ColorScale;

type LoadingState = 'loading';
type DisabledState = 'disabled';
type ErrorState = 'error';
export type ElementState = LoadingState | DisabledState | ErrorState;

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
export type IdSelectors<E extends string, Id extends string | undefined = never> = Id extends never
  ? never
  : `${E}__${Id}`;
type ElementPartsKeys<Name extends string, Opts extends ConfigOptions> =
  | StateSelectors<Name, Opts['states']>
  | IdSelectors<Name, Opts['ids']>
  | StateSelectors<IdSelectors<Name, Opts['ids']>, Opts['states']>;
type Selectors<RootElemName extends string, Opts extends ConfigOptions> =
  | Partial<Record<RootElemName, UserDefinedStyle | Opts['jsx']>>
  | Partial<Record<ElementPartsKeys<RootElemName, Opts>, UserDefinedStyle>>;

export type ElementObjectKey<K extends string> = K extends `${infer Parent}-${infer Rest}`
  ? `${Parent}${Capitalize<Rest>}`
  : K;

/**
 * A map that describes the possible combinations we need to generate
 * for each unique base element
 */
export type ElementsConfig = {
  root: WithOptions<never, never, never>;
  card: WithOptions<never, never, never>;
  header: WithOptions<never, never, never>;
  'header-title': WithOptions<never, never, never>;
  'header-subtitle': WithOptions<never, never, never>;

  authOptions: WithOptions<never, never, never>;

  socialButtons: WithOptions<never, never, never>;
  'socialButtons-buttonIcon': WithOptions<OAuthProvider, LoadingState | DisabledState, never>;
  'socialButtons-buttonBlock': WithOptions<OAuthProvider, LoadingState | DisabledState, never>;

  form: WithOptions<never, never, never>;
  'form-input': WithOptions<never, ErrorState | DisabledState, never>;
  'form-buttonPrimary': WithOptions<never, ErrorState | LoadingState, never>;
};

export type Elements = {
  [k in keyof ElementsConfig]: Selectors<ElementObjectKey<k> & string, ElementsConfig[k]>;
}[keyof ElementsConfig];

export type Variables = { colorPrimary?: ColorOption };

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
  // userButton?: Theme;
  /**
   * Theme overrides that apply only
   * to the `<UserProfile/>` component
   */
  // userProfile?: Theme;
};
