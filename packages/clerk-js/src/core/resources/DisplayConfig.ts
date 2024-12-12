import type {
  CaptchaProvider,
  CaptchaWidgetType,
  DisplayConfigJSON,
  DisplayConfigJSONSnapshot,
  DisplayConfigResource,
  DisplayThemeJSON,
  OAuthStrategy,
  PreferredSignInStrategy,
} from '@clerk/types';

import { BaseResource } from './internal';

export class DisplayConfig extends BaseResource implements DisplayConfigResource {
  id!: string;
  afterSignInUrl!: string;
  afterSignOutAllUrl!: string;
  afterSignOutOneUrl!: string;
  afterSignOutUrl!: string;
  afterSignUpUrl!: string;
  afterSwitchSessionUrl!: string;
  applicationName!: string;
  backendHost!: string;
  branded!: boolean;
  captchaPublicKey: string | null = null;
  captchaWidgetType: CaptchaWidgetType = null;
  captchaProvider: CaptchaProvider = 'turnstile';
  captchaPublicKeyInvisible: string | null = null;
  captchaOauthBypass: OAuthStrategy[] = [];
  captchaHeartbeat: boolean = false;
  captchaHeartbeatIntervalMs?: number = undefined;
  homeUrl!: string;
  instanceEnvironmentType!: string;
  faviconImageUrl!: string;
  logoImageUrl!: string;
  preferredSignInStrategy!: PreferredSignInStrategy;
  signInUrl!: string;
  signUpUrl!: string;
  supportEmail!: string;
  theme!: DisplayThemeJSON;
  userProfileUrl!: string;
  clerkJSVersion?: string;
  experimental__forceOauthFirst?: boolean;
  organizationProfileUrl!: string;
  createOrganizationUrl!: string;
  afterLeaveOrganizationUrl!: string;
  afterCreateOrganizationUrl!: string;
  googleOneTapClientId?: string;
  showDevModeWarning!: boolean;
  termsUrl!: string;
  privacyPolicyUrl!: string;
  waitlistUrl!: string;
  afterJoinWaitlistUrl!: string;

  public constructor(data: DisplayConfigJSON | DisplayConfigJSONSnapshot) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: DisplayConfigJSON | DisplayConfigJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.instanceEnvironmentType = data.instance_environment_type;
    this.applicationName = data.application_name;
    this.theme = data.theme;
    this.preferredSignInStrategy = data.preferred_sign_in_strategy;
    this.logoImageUrl = data.logo_image_url;
    this.faviconImageUrl = data.favicon_image_url;
    this.homeUrl = data.home_url;
    this.signInUrl = data.sign_in_url;
    this.signUpUrl = data.sign_up_url;
    this.userProfileUrl = data.user_profile_url;
    this.afterSignInUrl = data.after_sign_in_url;
    this.afterSignUpUrl = data.after_sign_up_url;
    this.afterSignOutOneUrl = data.after_sign_out_one_url;
    this.afterSignOutAllUrl = data.after_sign_out_all_url;
    this.afterSwitchSessionUrl = data.after_switch_session_url;
    this.branded = data.branded;
    this.captchaPublicKey = data.captcha_public_key;
    this.captchaWidgetType = data.captcha_widget_type;
    this.captchaProvider = data.captcha_provider;
    this.captchaPublicKeyInvisible = data.captcha_public_key_invisible;
    // These are the OAuth strategies we used to bypass the captcha for by default
    // before the introduction of the captcha_oauth_bypass field
    this.captchaOauthBypass = data.captcha_oauth_bypass || ['oauth_google', 'oauth_microsoft', 'oauth_apple'];
    this.captchaHeartbeat = data.captcha_heartbeat || false;
    this.captchaHeartbeatIntervalMs = data.captcha_heartbeat_interval_ms;
    this.supportEmail = data.support_email || '';
    this.clerkJSVersion = data.clerk_js_version;
    this.organizationProfileUrl = data.organization_profile_url;
    this.createOrganizationUrl = data.create_organization_url;
    this.afterLeaveOrganizationUrl = data.after_leave_organization_url;
    this.afterCreateOrganizationUrl = data.after_create_organization_url;
    this.googleOneTapClientId = data.google_one_tap_client_id;
    this.showDevModeWarning = data.show_devmode_warning;
    this.termsUrl = data.terms_url;
    this.privacyPolicyUrl = data.privacy_policy_url;
    this.waitlistUrl = data.waitlist_url;
    this.afterJoinWaitlistUrl = data.after_join_waitlist_url;
    return this;
  }

  public toJSON(): DisplayConfigJSONSnapshot {
    return {
      object: 'display_config',
      id: this.id,
      instance_environment_type: this.instanceEnvironmentType,
      application_name: this.applicationName,
      theme: this.theme,
      preferred_sign_in_strategy: this.preferredSignInStrategy,
      logo_image_url: this.logoImageUrl,
      favicon_image_url: this.faviconImageUrl,
      home_url: this.homeUrl,
      sign_in_url: this.signInUrl,
      sign_up_url: this.signUpUrl,
      user_profile_url: this.userProfileUrl,
      after_sign_in_url: this.afterSignInUrl,
      after_sign_up_url: this.afterSignUpUrl,
      after_sign_out_one_url: this.afterSignOutOneUrl,
      after_sign_out_all_url: this.afterSignOutAllUrl,
      after_switch_session_url: this.afterSwitchSessionUrl,
      branded: this.branded,
      captcha_public_key: this.captchaPublicKey,
      captcha_widget_type: this.captchaWidgetType,
      captcha_provider: this.captchaProvider,
      captcha_public_key_invisible: this.captchaPublicKeyInvisible,
      captcha_oauth_bypass: this.captchaOauthBypass,
      captcha_heartbeat: this.captchaHeartbeat,
      captcha_heartbeat_interval_ms: this.captchaHeartbeatIntervalMs,
      support_email: this.supportEmail,
      clerk_js_version: this.clerkJSVersion,
      organization_profile_url: this.organizationProfileUrl,
      create_organization_url: this.createOrganizationUrl,
      after_leave_organization_url: this.afterLeaveOrganizationUrl,
      after_create_organization_url: this.afterCreateOrganizationUrl,
      google_one_tap_client_id: this.googleOneTapClientId,
      show_devmode_warning: this.showDevModeWarning,
      terms_url: this.termsUrl,
      privacy_policy_url: this.privacyPolicyUrl,
      waitlist_url: this.waitlistUrl,
      after_join_waitlist_url: this.afterJoinWaitlistUrl,
    };
  }
}
