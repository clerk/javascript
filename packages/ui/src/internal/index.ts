import type { ClerkUiConstructor } from '@clerk/shared/ui';

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
 * Runtime brand value to identify valid UI objects
 */
export const UI_BRAND = '__clerkUI' as const;

/**
 * Ui type that carries appearance type information via phantom property
 * Tagged to ensure only official ui objects from @clerk/ui can be used
 *
 * ClerkUI is optional to support server-safe marker exports (react-server condition).
 * When ClerkUI is absent, the SDK will dynamically import it.
 */
export type Ui<A = any> = Tagged<
  {
    /**
     * Runtime brand to identify valid UI objects
     */
    __brand: typeof UI_BRAND;
    /**
     * ClerkUI constructor. Optional to support server-safe marker exports.
     * When absent (e.g., in React Server Components), the SDK resolves it via dynamic import.
     */
    ClerkUI?: ClerkUiConstructor;
    /**
     * Version of the UI package (for potential future use)
     */
    version?: string;
    /**
     * Phantom property for type-level appearance inference
     * This property never exists at runtime
     */
    __appearanceType?: A;
  },
  'ClerkUi'
>;

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
