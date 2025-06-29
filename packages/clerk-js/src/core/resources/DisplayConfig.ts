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
import { parseJSON } from './parser';

export class DisplayConfig extends BaseResource implements DisplayConfigResource {
  afterCreateOrganizationUrl: string = '';
  afterJoinWaitlistUrl: string = '';
  afterLeaveOrganizationUrl: string = '';
  afterSignInUrl = '';
  afterSignOutAllUrl: string = '';
  afterSignOutOneUrl: string = '';
  afterSignOutUrl = '';
  afterSignUpUrl = '';
  afterSwitchSessionUrl: string = '';
  applicationName = '';
  backendHost: string = '';
  branded: boolean = false;
  captchaHeartbeat: boolean = false;
  captchaHeartbeatIntervalMs?: number;
  captchaOauthBypass: OAuthStrategy[] = ['oauth_google', 'oauth_microsoft', 'oauth_apple'];
  captchaProvider: CaptchaProvider = 'turnstile';
  captchaPublicKey: string | null = null;
  captchaPublicKeyInvisible: string | null = null;
  captchaWidgetType: CaptchaWidgetType = null;
  clerkJSVersion = '';
  createOrganizationUrl = '';
  experimental__forceOauthFirst?: boolean;
  faviconImageUrl = '';
  googleOneTapClientId = '';
  homeUrl = '';
  id = '';
  instanceEnvironmentType = '';
  logoImageUrl = '';
  organizationProfileUrl = '';
  preferredSignInStrategy: PreferredSignInStrategy = 'password';
  privacyPolicyUrl = '';
  showDevModeWarning = false;
  signInUrl = '';
  signUpUrl = '';
  supportEmail = '';
  termsUrl = '';
  theme: DisplayThemeJSON = {
    general: {
      color: '#000000',
      background_color: '#ffffff',
      font_family: 'inherit',
      font_color: '#000000',
      label_font_weight: 'normal',
      padding: '0',
      border_radius: '0',
      box_shadow: 'none',
    },
    buttons: {
      font_color: '#000000',
      font_family: 'inherit',
      font_weight: 'normal',
    },
    accounts: {
      background_color: '#ffffff',
    },
  };
  userProfileUrl = '';
  waitlistUrl = '';
  authenticateWithRedirectParams = {};
  brandingName = '';
  clerkJSUrl = '';

  constructor(data: DisplayConfigJSON | DisplayConfigJSONSnapshot | null = null) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: DisplayConfigJSON | DisplayConfigJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    Object.assign(
      this,
      parseJSON<DisplayConfigResource>(data, {
        defaultValues: {
          afterSignInUrl: '',
          afterSignOutUrl: '',
          afterSignUpUrl: '',
          applicationName: '',
          authenticateWithRedirectParams: {},
          brandingName: '',
          clerkJSUrl: '',
          clerkJSVersion: '',
          createOrganizationUrl: '',
          faviconImageUrl: '',
          googleOneTapClientId: '',
          homeUrl: '',
          id: '',
          instanceEnvironmentType: '',
          logoImageUrl: '',
          organizationProfileUrl: '',
          preferredSignInStrategy: 'password' as PreferredSignInStrategy,
          privacyPolicyUrl: '',
          showDevModeWarning: false,
          signInUrl: '',
          signUpUrl: '',
          supportEmail: '',
          termsUrl: '',
          theme: {
            general: {
              color: '#000000',
              background_color: '#ffffff',
              font_family: 'inherit',
              font_color: '#000000',
              label_font_weight: 'normal',
              padding: '0',
              border_radius: '0',
              box_shadow: 'none',
            },
            buttons: {
              font_color: '#000000',
              font_family: 'inherit',
              font_weight: 'normal',
            },
            accounts: {
              background_color: '#ffffff',
            },
          } as DisplayThemeJSON,
          userProfileUrl: '',
          waitlistUrl: '',
        },
      }),
    );
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
      // @ts-expect-error
      authenticate_with_redirect_params: this.authenticateWithRedirectParams,
      branding_name: this.brandingName,
      clerk_js_url: this.clerkJSUrl,
    };
  }
}
