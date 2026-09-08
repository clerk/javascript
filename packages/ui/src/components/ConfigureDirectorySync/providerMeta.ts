import type { DirectorySyncProvider } from '@clerk/shared/types';

import type { LocalizationKey } from '@/customizables';
import { localizationKeys } from '@/customizables';

export interface DirectorySyncProviderMeta {
  name: LocalizationKey;
  /** Whether the IdP can push SCIM to Clerk's endpoint (self-serve supported). */
  supportsScim: boolean;
  /** Where the admin pastes the endpoint + token, as numbered instructions. */
  instructions: LocalizationKey[];
}

const instructionKeys = (provider: 'okta' | 'entra' | 'custom'): LocalizationKey[] => [
  localizationKeys(`configureDirectorySync.configureStep.instructions.${provider}.step1`),
  localizationKeys(`configureDirectorySync.configureStep.instructions.${provider}.step2`),
  localizationKeys(`configureDirectorySync.configureStep.instructions.${provider}.step3`),
  localizationKeys(`configureDirectorySync.configureStep.instructions.${provider}.step4`),
];

export const DIRECTORY_SYNC_PROVIDERS: Record<DirectorySyncProvider, DirectorySyncProviderMeta> = {
  okta: {
    name: localizationKeys('configureDirectorySync.providers.okta'),
    supportsScim: true,
    instructions: instructionKeys('okta'),
  },
  entra: {
    name: localizationKeys('configureDirectorySync.providers.entra'),
    supportsScim: true,
    instructions: instructionKeys('entra'),
  },
  google: {
    name: localizationKeys('configureDirectorySync.providers.google'),
    supportsScim: false,
    instructions: [],
  },
  custom: {
    name: localizationKeys('configureDirectorySync.providers.custom'),
    supportsScim: true,
    instructions: instructionKeys('custom'),
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
