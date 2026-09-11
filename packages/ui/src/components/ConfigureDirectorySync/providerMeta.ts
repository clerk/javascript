import type { DirectorySyncProvider } from '@clerk/shared/types';

import type { LocalizationKey } from '@/customizables';
import { localizationKeys } from '@/customizables';

/**
 * How the directory exchanges data with the identity provider.
 *
 * `push` providers hold a bearer token and push SCIM to Clerk's endpoint.
 * `pull` providers hand Clerk a stored credential and Clerk reads from them on
 * a schedule, so their setup collects a credential rather than handing one out.
 */
export type DirectorySyncMode = 'push' | 'pull';

export interface DirectorySyncProviderMeta {
  name: LocalizationKey;
  mode: DirectorySyncMode;
  /** Setup instructions for the admin, as numbered steps. */
  instructions: LocalizationKey[];
}

const instructionKeys = (provider: 'okta' | 'entra' | 'custom'): LocalizationKey[] => [
  localizationKeys(`configureDirectorySync.configureStep.instructions.${provider}.step1`),
  localizationKeys(`configureDirectorySync.configureStep.instructions.${provider}.step2`),
  localizationKeys(`configureDirectorySync.configureStep.instructions.${provider}.step3`),
  localizationKeys(`configureDirectorySync.configureStep.instructions.${provider}.step4`),
];

const googleInstructionKeys = (): LocalizationKey[] => [
  localizationKeys('configureDirectorySync.configureStep.instructions.google.step1'),
  localizationKeys('configureDirectorySync.configureStep.instructions.google.step2'),
  localizationKeys('configureDirectorySync.configureStep.instructions.google.step3'),
  localizationKeys('configureDirectorySync.configureStep.instructions.google.step4'),
  localizationKeys('configureDirectorySync.configureStep.instructions.google.step5'),
];

export const DIRECTORY_SYNC_PROVIDERS: Record<DirectorySyncProvider, DirectorySyncProviderMeta> = {
  okta: {
    name: localizationKeys('configureDirectorySync.providers.okta'),
    mode: 'push',
    instructions: instructionKeys('okta'),
  },
  entra: {
    name: localizationKeys('configureDirectorySync.providers.entra'),
    mode: 'push',
    instructions: instructionKeys('entra'),
  },
  google: {
    name: localizationKeys('configureDirectorySync.providers.google'),
    mode: 'pull',
    instructions: googleInstructionKeys(),
  },
  custom: {
    name: localizationKeys('configureDirectorySync.providers.custom'),
    mode: 'push',
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
