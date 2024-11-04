import type {
  CredentialReturn,
  PublicKeyCredentialCreationOptionsWithoutExtensions,
  PublicKeyCredentialRequestOptionsWithoutExtensions,
  PublicKeyCredentialWithAuthenticatorAssertionResponse,
  PublicKeyCredentialWithAuthenticatorAttestationResponse,
} from '@clerk/types';

import type { TokenCache } from '../../cache/types';

export type BuildClerkOptions = {
  publishableKey?: string;
  tokenCache?: TokenCache;
  /**
   * This is an experimental prop that is being used from expo apps,
   * this feature is only available for private beta users.
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
};
