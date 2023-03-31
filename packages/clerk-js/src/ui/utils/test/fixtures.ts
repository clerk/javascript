import type {
  AuthConfigJSON,
  ClientJSON,
  DisplayConfigJSON,
  EnvironmentJSON,
  OrganizationSettingsJSON,
  UserJSON,
  UserSettingsJSON,
} from '@clerk/types';

import { containsAllOfType } from '../containsAllOf';

export const createBaseEnvironmentJSON = (): EnvironmentJSON => {
  return {
    id: 'env_1',
    object: 'environment',
    auth_config: createBaseAuthConfig(),
    display_config: createBaseDisplayConfig(),
    organization_settings: createBaseOrganizationSettings(),
    user_settings: createBaseUserSettings(),
    meta: { responseHeaders: { country: 'us' } },
  };
};

const createBaseAuthConfig = (): AuthConfigJSON => {
  return {
    object: 'auth_config',
    id: 'aac_1',
    single_session_mode: true,
  };
};

const createBaseDisplayConfig = (): DisplayConfigJSON => {
  return {
    object: 'display_config',
    id: 'display_config_1',
    instance_environment_type: 'production',
    application_name: 'TestApp',
    theme: {
      buttons: {
        font_color: '#ffffff',
        font_family: '"Inter", sans-serif',
        font_weight: '600',
      },
      general: {
        color: '#6c47ff',
        padding: '1em',
        box_shadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        font_color: '#151515',
        font_family: '"Inter", sans-serif',
        border_radius: '0.5em',
        background_color: '#ffffff',
        label_font_weight: '600',
      },
      accounts: {
        background_color: '#f2f2f2',
      },
    },
    preferred_sign_in_strategy: 'password',
    logo_url: 'https://images.clerk.com/uploaded/img_logo.png',
    favicon_url: 'https://images.clerk.com/uploaded/img_favicon.png',
    home_url: 'https://dashboard.clerk.com',
    sign_in_url: 'https://dashboard.clerk.com/sign-in',
    sign_up_url: 'https://dashboard.clerk.com/sign-up',
    user_profile_url: 'https://accounts.clerk.com/user',
    after_sign_in_url: 'https://dashboard.clerk.com',
    after_sign_up_url: 'https://dashboard.clerk.com',
    after_sign_out_one_url: 'https://accounts.clerk.com/sign-in/choose',
    after_sign_out_all_url: 'https://dashboard.clerk.com/sign-in',
    after_switch_session_url: 'https://dashboard.clerk.com',
    organization_profile_url: 'https://accounts.clerk.com/organization',
    create_organization_url: 'https://accounts.clerk.com/create-organization',
    after_leave_organization_url: 'https://dashboard.clerk.com',
    after_create_organization_url: 'https://dashboard.clerk.com',
    support_email: null,
    backend_host: 'dapi.clerk.com',
    branded: true,
    experimental_force_oauth_first: false,
    clerk_js_version: '4',
  };
};

const createBaseOrganizationSettings = (): OrganizationSettingsJSON => {
  return {
    enabled: false,
    max_allowed_memberships: 5,
  } as OrganizationSettingsJSON;
};

const attributes = Object.freeze(
  containsAllOfType<keyof UserSettingsJSON['attributes']>()([
    'email_address',
    'phone_number',
    'username',
    'web3_wallet',
    'first_name',
    'last_name',
    'password',
    'authenticator_app',
    'backup_code',
  ]),
);

const socials = Object.freeze(
  containsAllOfType<keyof UserSettingsJSON['social']>()([
    'oauth_facebook',
    'oauth_google',
    'oauth_hubspot',
    'oauth_github',
    'oauth_tiktok',
    'oauth_gitlab',
    'oauth_discord',
    'oauth_twitter',
    'oauth_twitch',
    'oauth_linkedin',
    'oauth_dropbox',
    'oauth_atlassian',
    'oauth_bitbucket',
    'oauth_microsoft',
    'oauth_notion',
    'oauth_apple',
    'oauth_line',
    'oauth_instagram',
    'oauth_coinbase',
    'oauth_spotify',
    'oauth_xero',
    'oauth_box',
    'oauth_slack',
    'oauth_linear',
  ]),
);

const createBaseUserSettings = (): UserSettingsJSON => {
  const attributeConfig = Object.fromEntries(
    attributes.map(attribute => [
      attribute,
      {
        enabled: false,
        required: false,
        used_for_first_factor: false,
        first_factors: [],
        used_for_second_factor: false,
        second_factors: [],
        verifications: [],
        verify_at_sign_up: false,
      },
    ]),
  ) as any as UserSettingsJSON['attributes'];

  const socialConfig = Object.fromEntries(
    socials.map(social => [social, { enabled: false, required: false, authenticatable: false, strategy: social }]),
  ) as any as UserSettingsJSON['social'];

  return {
    attributes: { ...attributeConfig },
    social: { ...socialConfig },
    sign_in: {
      second_factor: {
        required: false,
      },
    },
    sign_up: {
      custom_action_required: false,
      progressive: true,
      disable_hibp: false,
    },
    restrictions: {
      allowlist: {
        enabled: false,
      },
      blocklist: {
        enabled: false,
      },
    },
  };
};

export const createBaseClientJSON = (): ClientJSON => {
  return {} as ClientJSON;
};

// TODO:
export const createUserFixture = (): UserJSON => {
  return {
    first_name: 'Firstname',
    last_name: 'Lastname',
    profile_image_url: 'https://lh3.googleusercontent.com/a/public-photo-kmmfZIb=s1000-c',
  } as UserJSON;
};
