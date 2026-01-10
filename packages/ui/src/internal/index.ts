import type { Appearance } from './appearance';

export type { ComponentControls, MountComponentRenderer } from '../Components';
export type { WithInternalRouting } from './routing';

/**
 * Extracts the appearance type from a Ui object. We got 3 cases:
 * - If the Ui type has __appearanceType with a specific type, extract it
 * - If __appearanceType is 'any' or 'unknown', fallback to base Appearance type
 * - Otherwise, fallback to the base Appearance type
 */
export type ExtractAppearanceType<T, Default> = T extends { __appearanceType?: infer A }
  ? unknown extends A // If A is 'any' or 'unknown', fallback to Default
    ? Default
    : A
  : Default;

/**
 * The well-known symbol key used to identify legitimate @clerk/ui exports.
 * Uses Symbol.for() to ensure the same symbol is used across module boundaries.
 * @internal
 */
export const UI_BRAND_SYMBOL_KEY = 'clerk:ui';

/**
 * UiVersion type that carries appearance type information via phantom property
 * Used for version pinning with hot loading
 *
 * @typeParam A - The appearance type for styling customization
 */
export type UiVersion<A = unknown> = {
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
};

/**
 * UiModule type represents the ClerkUi class constructor
 * Used when bundling @clerk/ui directly instead of hot loading
 *
 * @typeParam A - The appearance type for styling customization
 * @typeParam I - The instance type returned by the constructor (defaults to unknown for external consumers)
 */
export type UiModule<A = unknown, I = unknown> = {
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
  new (...args: unknown[]): I;
  /**
   * Phantom property for type-level appearance inference
   * This property never exists at runtime
   */
  __appearanceType?: A;
};

/**
 * Ui type that accepts either:
 * - UiVersion: version pinning object for hot loading
 * - UiModule: ClerkUi class constructor for direct module usage
 *
 * @typeParam A - The appearance type for styling customization
 */
export type Ui<A = unknown> = UiVersion<A> | UiModule<A>;

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
