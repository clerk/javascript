import type { Appearance } from './appearance';

export type { ComponentControls, MountComponentRenderer } from '../Components';
export type { WithInternalRouting } from './routing';

// Re-export branded types from @clerk/shared for backwards compatibility
export type { ExtractAppearanceType, Ui } from '@clerk/shared/types';

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
  version: PACKAGE_VERSION,
  url: 'http://localhost:4011/npm/ui.browser.js',
} as Ui<Appearance & { newprop?: string }>;
