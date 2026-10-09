import { createClerkClient } from '@clerk/backend';
import { parsePublishableKey } from '@clerk/shared/keys';

import { instanceKeys } from './instanceKeys';

export async function setupOAuthProvider(
  { applicationName, publishableKey, patchConfig },
  { consentScreenEnabled = true } = {},
) {
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
