import type {
  CredentialReturn,
  DomainOrProxyUrl,
  PublicKeyCredentialCreationOptionsWithoutExtensions,
  PublicKeyCredentialRequestOptionsWithoutExtensions,
  PublicKeyCredentialWithAuthenticatorAssertionResponse,
  PublicKeyCredentialWithAuthenticatorAttestationResponse,
} from '@clerk/shared/types';

import type { TokenCache } from '../../cache/types';

export interface IStorage {
  set: (key: string, value: string) => Promise<void>;
  get: (key: string) => Promise<string | null>;
}

export type BuildClerkOptions = {
  publishableKey?: string;
  tokenCache?: TokenCache;
  proxyUrl?: DomainOrProxyUrl['proxyUrl'];
  domain?: DomainOrProxyUrl['domain'];
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
  __experimental_resourceCache?: () => IStorage;
};
