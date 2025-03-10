import type { DisplayThemeJSON } from './json';
import type { ClerkResource } from './resource';
import type { OAuthStrategy } from './strategies';

export type PreferredSignInStrategy = 'password' | 'otp';
export type CaptchaWidgetType = 'smart' | 'invisible' | null;
export type CaptchaProvider = 'turnstile';

export interface DisplayConfigJSON {
  object: 'display_config';
  id: string;
  after_sign_in_url: string;
  after_sign_out_all_url: string;
  after_sign_out_one_url: string;
  after_sign_up_url: string;
  after_switch_session_url: string;
  application_name: string;
  branded: boolean;
  captcha_public_key: string | null;
  captcha_widget_type: CaptchaWidgetType;
  captcha_public_key_invisible: string | null;
  captcha_provider: CaptchaProvider;
  captcha_oauth_bypass: OAuthStrategy[] | null;
  home_url: string;
  instance_environment_type: string;
  /* @deprecated */
  logo_url: string;
  /* @deprecated */
  favicon_url: string;
  logo_image_url: string;
  favicon_image_url: string;
  preferred_sign_in_strategy: PreferredSignInStrategy;
  sign_in_url: string;
  sign_up_url: string;
  support_email: string;
  theme: DisplayThemeJSON;
  user_profile_url: string;
  clerk_js_version?: string;
  organization_profile_url: string;
  create_organization_url: string;
  after_leave_organization_url: string;
  after_create_organization_url: string;
  google_one_tap_client_id?: string;
}

export interface DisplayConfigResource extends ClerkResource {
  id: string;
  afterSignInUrl: string;
  afterSignOutAllUrl: string;
  afterSignOutOneUrl: string;
  afterSignUpUrl: string;
  afterSwitchSessionUrl: string;
  applicationName: string;
  backendHost: string;
  branded: boolean;
  captchaPublicKey: string | null;
  captchaWidgetType: CaptchaWidgetType;
  captchaProvider: CaptchaProvider;
  captchaPublicKeyInvisible: string | null;
  /**
   * An array of OAuth strategies for which we will bypass the captcha.
   * We trust that the provider will verify that the user is not a bot on their end.
   * This can also be used to bypass the captcha for a specific OAuth provider on a per-instance basis.
   */
  captchaOauthBypass: OAuthStrategy[];
  homeUrl: string;
  instanceEnvironmentType: string;
  logoImageUrl: string;
  faviconImageUrl: string;
  logoUrl: string;
  faviconUrl: string;
  preferredSignInStrategy: PreferredSignInStrategy;
  signInUrl: string;
  signUpUrl: string;
  supportEmail: string;
  theme: DisplayThemeJSON;
  userProfileUrl: string;
  clerkJSVersion?: string;
  experimental__forceOauthFirst?: boolean;
  organizationProfileUrl: string;
  createOrganizationUrl: string;
  afterLeaveOrganizationUrl: string;
  afterCreateOrganizationUrl: string;
  googleOneTapClientId?: string;
}
