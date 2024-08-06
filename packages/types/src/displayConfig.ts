import type { DisplayThemeJSON } from './json';
import type { ClerkResource } from './resource';

export type PreferredSignInStrategy = 'password' | 'otp';
export type CaptchaWidgetType = 'smart' | 'invisible' | null;
export type CaptchaProvider = 'hcaptcha' | 'turnstile';

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
  home_url: string;
  instance_environment_type: string;
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
  show_devmode_warning: boolean;
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
  homeUrl: string;
  instanceEnvironmentType: string;
  logoImageUrl: string;
  faviconImageUrl: string;
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
  showDevModeWarning: boolean;
}
