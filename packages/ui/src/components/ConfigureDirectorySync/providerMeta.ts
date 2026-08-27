import type { DirectorySyncProvider } from '@clerk/shared/types';

export interface DirectorySyncProviderMeta {
  name: string;
  /** Whether the IdP can push SCIM to Clerk's endpoint (self-serve supported). */
  supportsScim: boolean;
  /** Where the admin pastes the endpoint + token, as numbered instructions. */
  instructions: string[];
}

export const DIRECTORY_SYNC_PROVIDERS: Record<DirectorySyncProvider, DirectorySyncProviderMeta> = {
  okta: {
    name: 'Okta Workforce',
    supportsScim: true,
    instructions: [
      'In the Okta Admin Console, open the application used for your SSO connection.',
      'Open the Provisioning tab and select Configure API Integration.',
      'Check Enable API integration, then paste the SCIM endpoint URL and bearer token below.',
      'Under Provisioning to App, enable Create Users, Update User Attributes, and Deactivate Users.',
    ],
  },
  entra: {
    name: 'Microsoft Entra ID',
    supportsScim: true,
    instructions: [
      'In the Microsoft Entra admin center, open Enterprise applications and select the application used for your SSO connection.',
      'Select Provisioning and set the provisioning mode to Automatic.',
      'Paste the SCIM endpoint URL as the Tenant URL and the bearer token as the Secret Token, then select Test Connection.',
      'Assign the users and groups to provision, then turn provisioning On.',
    ],
  },
  google: {
    name: 'Google Workspace',
    supportsScim: false,
    instructions: [],
  },
  custom: {
    name: 'Custom SCIM provider',
    supportsScim: true,
    instructions: [
      'Create a SCIM 2.0 provisioning integration in your identity provider.',
      'Paste the SCIM endpoint URL as the base URL for the integration.',
      'Configure the integration to authenticate with the bearer token below.',
      'Enable provisioning for user create, update, and deactivate events.',
    ],
  },
};

/**
 * Client-side mirror of the server's provider derivation: the directory's SCIM
 * provider follows from the SSO connection's identity provider. Used for
 * display before the directory exists; the server derives authoritatively on
 * create.
 */
export function directorySyncProviderForConnection(connectionProvider: string): DirectorySyncProvider {
  switch (connectionProvider) {
    case 'saml_okta':
      return 'okta';
    case 'saml_microsoft':
      return 'entra';
    case 'saml_google':
      return 'google';
    default:
      return 'custom';
  }
}
