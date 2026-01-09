import type { Appearance } from './appearance';

export type { ComponentControls, MountComponentRenderer } from '../Components';
export type { WithInternalRouting } from './routing';

/**
 * Extracts the appearance type from a Ui object. We got 3 cases:
 * - If the Ui type has __appearanceType with a specific type, extract it
 * - If __appearanceType is 'any', fallback to base Appearance type
 * - Otherwise, fallback to the base Appearance type
 */
export type ExtractAppearanceType<T, Default> = T extends { __appearanceType?: infer A }
  ? 0 extends 1 & A // Check if A is 'any' (this trick works because 1 & any = any, and 0 extends any)
    ? Default
    : A
  : Default;

declare const Tags: unique symbol;
type Tagged<BaseType, Tag extends PropertyKey> = BaseType & { [Tags]: { [K in Tag]: void } };

/**
 * The well-known symbol key used to identify legitimate @clerk/ui exports.
 * Uses Symbol.for() to ensure the same symbol is used across module boundaries.
 * @internal
 */
export const UI_BRAND_SYMBOL_KEY = 'clerk:ui';

/**
 * UiVersion type that carries appearance type information via phantom property
 * Tagged to ensure only official ui objects from @clerk/ui can be used
 * Used for version pinning with hot loading
 */
export type UiVersion<A = any> = Tagged<
  {
    /**
     * Brand symbol to identify legitimate @clerk/ui exports at runtime
     */
    __brand: symbol;
    version: string;
    url?: string;
    /**
     * Phantom property for type-level appearance inference
     * This property never exists at runtime
     */
    __appearanceType?: A;
  },
  'ClerkUi'
>;

/**
 * UiModule type represents the ClerkUi class constructor
 * Used when bundling @clerk/ui directly instead of hot loading
 * Tagged to ensure only official ClerkUi class from @clerk/ui can be used
 */
export type UiModule<A = any> = Tagged<
  {
    /**
     * Brand symbol to identify legitimate @clerk/ui exports at runtime
     */
    __brand: symbol;
    /**
     * The version string of the UI module
     */
    version: string;
    /**
     * Constructor signature - must be callable with new
     */
    new (...args: any[]): any;
    /**
     * Phantom property for type-level appearance inference
     * This property never exists at runtime
     */
    __appearanceType?: A;
  },
  'ClerkUiModule'
>;

/**
 * Ui type that accepts either:
 * - UiVersion: version pinning object for hot loading
 * - UiModule: ClerkUi class constructor for direct module usage
 */
export type Ui<A = any> = UiVersion<A> | UiModule<A>;

export type {
  AlphaColorScale,
  Appearance,
  APIKeysTheme,
  BaseTheme,
  CaptchaAppearanceOptions,
  CheckoutTheme,
  ColorScale,
  ColorScaleWithRequiredBase,
  CreateOrganizationTheme,
  CssColorOrAlphaScale,
  CssColorOrScale,
  ElementObjectKey,
  Elements,
  ElementsConfig,
  ElementState,
  FontFamily,
  IdSelectors,
  Options,
  OAuthConsentTheme,
  OrganizationListTheme,
  OrganizationProfileTheme,
  OrganizationSwitcherTheme,
  PlanDetailTheme,
  PricingTableTheme,
  SignInTheme,
  SignUpTheme,
  StateSelectors,
  SubscriptionDetailsTheme,
  TaskChooseOrganizationTheme,
  Theme,
  UserAvatarTheme,
  UserButtonTheme,
  UserProfileTheme,
  UserVerificationTheme,
  Variables,
  WaitlistTheme,
} from './appearance';

// export type {
//   AlertId,
//   CardActionId,
//   FieldId,
//   MenuId,
//   OrganizationPreviewId,
//   ProfilePageId,
//   ProfileSectionId,
//   SelectId,
//   UserPreviewId,
// } from './internal/elementIds';

/**
 * @internal
 * Local ui object for testing purposes
 * Do not use
 */
export const localUiForTesting = {
  __brand: Symbol.for(UI_BRAND_SYMBOL_KEY),
  version: PACKAGE_VERSION,
  url: 'http://localhost:4011/npm/ui.browser.js',
} as UiVersion<Appearance & { newprop?: string }>;
