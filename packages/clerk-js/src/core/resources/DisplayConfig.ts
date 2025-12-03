import type {
  CaptchaProvider,
  CaptchaWidgetType,
  DisplayConfigJSON,
  DisplayConfigJSONSnapshot,
  DisplayConfigResource,
  DisplayThemeJSON,
  OAuthStrategy,
  PreferredSignInStrategy,
} from '@clerk/shared/types';

import { BaseResource } from './internal';

export class DisplayConfig extends BaseResource implements DisplayConfigResource {
  afterCreateOrganizationUrl: string = '';
  afterJoinWaitlistUrl: string = '';
  afterLeaveOrganizationUrl: string = '';
  afterSignInUrl: string = '';
  afterSignOutAllUrl: string = '';
  afterSignOutOneUrl: string = '';
  afterSignOutUrl: string = '';
  afterSignUpUrl: string = '';
  afterSwitchSessionUrl: string = '';
  applicationName: string = '';
  backendHost: string = '';
  branded: boolean = false;
  captchaHeartbeat: boolean = false;
  captchaHeartbeatIntervalMs?: number;
  captchaOauthBypass: OAuthStrategy[] = ['oauth_google', 'oauth_microsoft', 'oauth_apple'];
  captchaProvider: CaptchaProvider = 'turnstile';
  captchaPublicKey: string | null = null;
  captchaPublicKeyInvisible: string | null = null;
  captchaWidgetType: CaptchaWidgetType = null;
  clerkJSVersion?: string;
  createOrganizationUrl: string = '';
  faviconImageUrl: string = '';
  googleOneTapClientId?: string;
  homeUrl: string = '';
  id: string = '';
  instanceEnvironmentType: string = '';
  logoImageUrl: string = '';
  organizationProfileUrl: string = '';
  preferredSignInStrategy: PreferredSignInStrategy = 'password';
  privacyPolicyUrl: string = '';
  showDevModeWarning: boolean = false;
  signInUrl: string = '';
  signUpUrl: string = '';
  supportEmail: string = '';
  termsUrl: string = '';
  theme: DisplayThemeJSON = {} as DisplayThemeJSON;
  userProfileUrl: string = '';
  waitlistUrl: string = '';

  public constructor(data: DisplayConfigJSON | DisplayConfigJSONSnapshot | null = null) {
    super();

    this.fromJSON(data);
  }

  protected fromJSON(data: DisplayConfigJSON | DisplayConfigJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    this.afterCreateOrganizationUrl = this.withDefault(
      data.after_create_organization_url,
      this.afterCreateOrganizationUrl,
    );
    this.afterJoinWaitlistUrl = this.withDefault(data.after_join_waitlist_url, this.afterJoinWaitlistUrl);
    this.afterLeaveOrganizationUrl = this.withDefault(
      data.after_leave_organization_url,
      this.afterLeaveOrganizationUrl,
    );
    this.afterSignInUrl = this.withDefault(data.after_sign_in_url, this.afterSignInUrl);
    this.afterSignOutAllUrl = this.withDefault(data.after_sign_out_all_url, this.afterSignOutAllUrl);
    this.afterSignOutOneUrl = this.withDefault(data.after_sign_out_one_url, this.afterSignOutOneUrl);
    this.afterSignUpUrl = this.withDefault(data.after_sign_up_url, this.afterSignUpUrl);
    this.afterSwitchSessionUrl = this.withDefault(data.after_switch_session_url, this.afterSwitchSessionUrl);
    this.applicationName = this.withDefault(data.application_name, this.applicationName);
    this.branded = this.withDefault(data.branded, this.branded);
    this.captchaHeartbeat = this.withDefault(data.captcha_heartbeat, this.captchaHeartbeat);
    this.captchaHeartbeatIntervalMs = this.withDefault(
      data.captcha_heartbeat_interval_ms,
      this.captchaHeartbeatIntervalMs,
    );
    this.captchaOauthBypass = this.withDefault(data.captcha_oauth_bypass, this.captchaOauthBypass);
    this.captchaProvider = this.withDefault(data.captcha_provider, this.captchaProvider);
    this.captchaPublicKey = this.withDefault(data.captcha_public_key, this.captchaPublicKey);
    this.captchaPublicKeyInvisible = this.withDefault(
      data.captcha_public_key_invisible,
      this.captchaPublicKeyInvisible,
    );
    this.captchaWidgetType = this.withDefault(data.captcha_widget_type, this.captchaWidgetType);
    this.clerkJSVersion = this.withDefault(data.clerk_js_version, this.clerkJSVersion);
    this.createOrganizationUrl = this.withDefault(data.create_organization_url, this.createOrganizationUrl);
    this.faviconImageUrl = this.withDefault(data.favicon_image_url, this.faviconImageUrl);
    this.googleOneTapClientId = this.withDefault(data.google_one_tap_client_id, this.googleOneTapClientId);
    this.homeUrl = this.withDefault(data.home_url, this.homeUrl);
    this.id = this.withDefault(data.id, this.id);
    this.instanceEnvironmentType = this.withDefault(data.instance_environment_type, this.instanceEnvironmentType);
    this.logoImageUrl = this.withDefault(data.logo_image_url, this.logoImageUrl);
    this.organizationProfileUrl = this.withDefault(data.organization_profile_url, this.organizationProfileUrl);
    this.preferredSignInStrategy = this.withDefault(data.preferred_sign_in_strategy, this.preferredSignInStrategy);
    this.privacyPolicyUrl = this.withDefault(data.privacy_policy_url, this.privacyPolicyUrl);
    this.showDevModeWarning = this.withDefault(data.show_devmode_warning, this.showDevModeWarning);
    this.signInUrl = this.withDefault(data.sign_in_url, this.signInUrl);
    this.signUpUrl = this.withDefault(data.sign_up_url, this.signUpUrl);
    this.supportEmail = this.withDefault(data.support_email, this.supportEmail);
    this.termsUrl = this.withDefault(data.terms_url, this.termsUrl);
    this.theme = this.withDefault(data.theme, this.theme);
    this.userProfileUrl = this.withDefault(data.user_profile_url, this.userProfileUrl);
    this.waitlistUrl = this.withDefault(data.waitlist_url, this.waitlistUrl);

    return this;
  }

  public __internal_toSnapshot(): DisplayConfigJSONSnapshot {
    return {
      object: 'display_config',
      after_create_organization_url: this.afterCreateOrganizationUrl,
      after_join_waitlist_url: this.afterJoinWaitlistUrl,
      after_leave_organization_url: this.afterLeaveOrganizationUrl,
      after_sign_in_url: this.afterSignInUrl,
      after_sign_out_all_url: this.afterSignOutAllUrl,
      after_sign_out_one_url: this.afterSignOutOneUrl,
      after_sign_up_url: this.afterSignUpUrl,
      after_switch_session_url: this.afterSwitchSessionUrl,
      application_name: this.applicationName,
      branded: this.branded,
      captcha_heartbeat_interval_ms: this.captchaHeartbeatIntervalMs,
      captcha_heartbeat: this.captchaHeartbeat,
      captcha_oauth_bypass: this.captchaOauthBypass,
      captcha_provider: this.captchaProvider,
      captcha_public_key_invisible: this.captchaPublicKeyInvisible,
      captcha_public_key: this.captchaPublicKey,
      captcha_widget_type: this.captchaWidgetType,
      clerk_js_version: this.clerkJSVersion,
      create_organization_url: this.createOrganizationUrl,
      favicon_image_url: this.faviconImageUrl,
      google_one_tap_client_id: this.googleOneTapClientId,
      home_url: this.homeUrl,
      id: this.id,
      instance_environment_type: this.instanceEnvironmentType,
      logo_image_url: this.logoImageUrl,
      organization_profile_url: this.organizationProfileUrl,
      preferred_sign_in_strategy: this.preferredSignInStrategy,
      privacy_policy_url: this.privacyPolicyUrl,
      show_devmode_warning: this.showDevModeWarning,
      sign_in_url: this.signInUrl,
      sign_up_url: this.signUpUrl,
      support_email: this.supportEmail,
      terms_url: this.termsUrl,
      theme: this.theme,
      user_profile_url: this.userProfileUrl,
      waitlist_url: this.waitlistUrl,
    };
  }
}
