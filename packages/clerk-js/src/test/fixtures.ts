/* eslint-disable  */
// @ts-nocheck

import type {
  AuthConfigJSON,
  ClientJSON,
  CommerceSettingsJSON,
  DisplayConfigJSON,
  EnvironmentJSON,
  OrganizationSettingsJSON,
  UserJSON,
  UserSettingsJSON,
} from '@clerk/shared/types';

/**
 * Enforces that an array contains ALL keys of T
 */
const containsAllOfType =
  <T>() =>
  <U extends Readonly<T[]>>(array: U & ([T] extends [U[number]] ? unknown : 'Invalid')) =>
    array;

export const createBaseEnvironmentJSON = (): EnvironmentJSON => {
  return {
    id: 'env_1',
    object: 'environment',
    auth_config: createBaseAuthConfig(),
    display_config: createBaseDisplayConfig(),
    organization_settings: createBaseOrganizationSettings(),
    user_settings: createBaseUserSettings(),
    commerce_settings: createBaseCommerceSettings(),
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
    logo_image_url: 'https://images.clerk.com/uploaded/img_logo.png',
    favicon_image_url: 'https://images.clerk.com/uploaded/img_favicon.png',
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
    support_email: '',
    branded: true,
    clerk_js_version: '4',
  };
};

const createBaseOrganizationSettings = (): OrganizationSettingsJSON => {
  return {
    enabled: false,
    max_allowed_memberships: 5,
    force_organization_selection: false,
    domains: {
      enabled: false,
      enrollment_modes: [],
    },
    slug: {
      disabled: true,
    },
  } as unknown as OrganizationSettingsJSON;
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
    'passkey',
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
    'oauth_linkedin_oidc',
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
    'oauth_x',
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
  ) as UserSettingsJSON['attributes'];

  const socialConfig: UserSettingsJSON['social'] = Object.fromEntries(
    socials.map(social => [
      social,
      {
        enabled: false,
        required: false,
        authenticatable: false,
        strategy: social,
      },
    ]),
  );

  const passwordSettingsConfig = {
    allowed_special_characters: '',
    max_length: 0,
    min_length: 8,
    require_special_char: false,
    require_numbers: false,
    require_lowercase: false,
    require_uppercase: false,
    disable_hibp: true,
    show_zxcvbn: false,
    min_zxcvbn_strength: 0,
  } as UserSettingsJSON['password_settings'];

  const passkeySettingsConfig = {
    allow_autofill: false,
    show_sign_in_button: false,
  } as UserSettingsJSON['passkey_settings'];

  return {
    attributes: { ...attributeConfig },
    actions: { delete_self: false, create_organization: false },
    social: { ...socialConfig },
    saml: { enabled: false },
    enterprise_sso: { enabled: false },
    sign_in: {
      second_factor: {
        required: false,
      },
    },
    sign_up: {
      custom_action_required: false,
      progressive: true,
      captcha_enabled: false,
      disable_hibp: false,
      mode: 'public',
    },
    restrictions: {
      allowlist: {
        enabled: false,
      },
      blocklist: {
        enabled: false,
      },
    },
    password_settings: passwordSettingsConfig,
    passkey_settings: passkeySettingsConfig,
  };
};

export const createBaseClientJSON = (): ClientJSON => {
  return {} as ClientJSON;
};

const createBaseCommerceSettings = (): CommerceSettingsJSON => {
  return {
    object: 'commerce_settings',
    id: 'commerce_settings_1',
    billing: {
      user: {
        enabled: false,
        has_paid_plans: false,
      },
      organization: {
        enabled: false,
        has_paid_plans: false,
      },
      stripe_publishable_key: '',
    },
  };
};

export const createUserFixture = (): UserJSON => {
  return {
    first_name: 'Firstname',
    last_name: 'Lastname',
    image_url:
      'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLTmR2TUtFQzN5cUVpMVFjV0UzQjExbF9WUEVOWW5manlLMlVQd0tCSWw9czEwMDAtYyIsInMiOiJkRkowS3dTSkRINndiODE5cXJTUUxxaWF1ZS9QcHdndC84L0lUUlpYNHpnIn0?width=160',
  } as UserJSON;
};
