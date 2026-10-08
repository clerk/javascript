import { createClerkClient } from '@clerk/backend';
import { parsePublishableKey } from '@clerk/shared/keys';

import { instanceKeys } from '../presets/instanceKeys';
import { defineConfig } from '../presets/platformApplication.js';

export default defineConfig({
  config: {
    auth_access_control: {
      allowlist_blocklist_enforced_on_sign_in: true,
    },
    auth_attack_protection: {
      bot_protection: {
        captcha_enabled: false,
        captcha_widget_type: '',
      },
      email_link_require_same_client: false,
      user_lockout: {
        max_attempts: 100,
      },
    },
    auth_email: {
      sign_in_strategies: ['email_code', 'email_link'],
    },
    auth_multi_factor: {
      authenticator_app: {
        enabled: true,
      },
      backup_code: {
        enabled: true,
      },
    },
    auth_password: {
      device_trust: {
        enabled: false,
      },
      enforce_hibp_on_sign_in: false,
      min_length: 8,
      require_special_char: true,
    },
    auth_phone: {
      second_factor_strategies: ['phone_code'],
      sign_in_strategies: ['phone_code'],
      used_for_second_factor: true,
      used_for_sign_in: true,
      used_for_sign_up: true,
      verification_strategies: ['phone_code'],
      verify_at_sign_up: true,
    },
    auth_username: {
      used_for_sign_in: true,
      used_for_sign_up: true,
    },
    auth_web3: {
      sign_in_strategies: ['web3_metamask_signature'],
      used_for_sign_in: true,
      used_for_sign_up: true,
      verification_strategies: ['web3_metamask_signature'],
      verify_at_sign_up: true,
    },
    connection_oauth_github: {
      authenticatable: false,
    },
    connection_oauth_google: {
      block_email_subaddresses: false,
    },
    organization_settings: {
      domains_default_role: 'org:member',
      domains_enabled: true,
      domains_enrollment_modes: ['manual_invitation', 'automatic_invitation', 'automatic_suggestion'],
      enabled: true,
      force_organization_selection: false,
      max_allowed_memberships: 3,
      organization_creation_defaults: {
        detect_from_email_domain: {
          enabled: false,
        },
        enabled: false,
        fallback: {
          name: '',
        },
        organization_name_template: {
          enabled: false,
          template: '',
        },
      },
      slug_disabled: false,
    },
    session_settings: {
      multi_session_enabled: true,
    },
    user_model: {
      first_name: {
        enabled: true,
      },
      last_name: {
        enabled: true,
      },
    },
  },
  setup: async context => {
    // setup allowed origins for the electron tests
    await context.clerkClient.instance.update({ allowedOrigins: ['clerk://app'] });
    await setup(context);
  },
});

export async function setup({ applicationName, publishableKey, patchConfig }, consentScreenEnabled = true) {
  const parsedPublishableKey = parsePublishableKey(publishableKey);
  if (!parsedPublishableKey) {
    throw new Error('The created application has an invalid publishable key.');
  }

  const oauthProviderUrl = `https://${parsePublishableKey(instanceKeys.get('oauth-provider').pk).frontendApi}`;

  const client = await createClerkClient({
    secretKey: instanceKeys.get('oauth-provider').sk,
  }).oauthApplications.create({
    name: applicationName,
    redirectUris: [`https://${parsedPublishableKey.frontendApi}/v1/oauth_callback`],
    scopes: 'profile email',
    public: false,
    consentScreenEnabled,
  });

  if (typeof client.clientId !== 'string' || typeof client.clientSecret !== 'string') {
    throw new Error('The OAuth client registration response does not contain a client ID and secret.');
  }

  await patchConfig({
    connections_oauth_custom: {
      e2e_oauth_provider: {
        auth_url: `${oauthProviderUrl}/oauth/authorize`,
        authenticatable: true,
        base_scopes: [],
        client_id: client.clientId,
        client_secret: client.clientSecret,
        discovery_url: `${oauthProviderUrl}/.well-known/openid-configuration`,
        enabled: true,
        name: 'E2E OAuth Provider',
        requires_pkce: true,
        token_url: `${oauthProviderUrl}/oauth/token`,
        user_info_url: `${oauthProviderUrl}/oauth/userinfo`,
        user_mapping: {
          id: {
            path: 'user_id',
          },
        },
      },
    },
  });
}
