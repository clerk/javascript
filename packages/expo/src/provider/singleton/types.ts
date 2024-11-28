import type {
  ClientJSON,
  CredentialReturn,
  EnvironmentJSON,
  PublicKeyCredentialCreationOptionsWithoutExtensions,
  PublicKeyCredentialRequestOptionsWithoutExtensions,
  PublicKeyCredentialWithAuthenticatorAssertionResponse,
  PublicKeyCredentialWithAuthenticatorAttestationResponse,
} from '@clerk/types';

import type { TokenCache } from '../../cache/types';

export interface IAsyncStorage {
  setEnvironment: (environmentJSON: EnvironmentJSON) => Promise<void>;
  getEnvironment: () => Promise<EnvironmentJSON | null>;
  setClient: (clientJSON: ClientJSON) => Promise<void>;
  getClient: () => Promise<ClientJSON | null>;
}

export type BuildClerkOptions = {
  publishableKey?: string;
  tokenCache?: TokenCache;
  /**
   * Note: Passkey support in Expo is currently in a limited rollout phase.
   * If you're interested in using this feature, please contact us for early access or additional details.
   *
   * @experimental This API is experimental and may change at any moment.
   */
  __experimental_passkeys?: {
    get: ({
      publicKeyOptions,
    }: {
      publicKeyOptions: PublicKeyCredentialRequestOptionsWithoutExtensions;
    }) => Promise<CredentialReturn<PublicKeyCredentialWithAuthenticatorAssertionResponse>>;
    create: (
      publicKeyCredential: PublicKeyCredentialCreationOptionsWithoutExtensions,
    ) => Promise<CredentialReturn<PublicKeyCredentialWithAuthenticatorAttestationResponse>>;
    isSupported: () => boolean;
    isAutoFillSupported: () => Promise<boolean>;
  };
  __experimental_asyncStorage?: (publishableKey: string) => IAsyncStorage;
};
