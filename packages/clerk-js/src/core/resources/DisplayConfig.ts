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
import { parseJSON, serializeToJSON } from './parser';

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
      ...serializeToJSON(this),
    } as DisplayConfigJSONSnapshot;
  }
}
