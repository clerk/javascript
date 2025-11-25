import type {
  CredentialReturn,
  PublicKeyCredentialCreationOptionsWithoutExtensions,
  PublicKeyCredentialRequestOptionsWithoutExtensions,
  PublicKeyCredentialWithAuthenticatorAssertionResponse as ClerkPublicKeyCredentialWithAuthenticatorAssertionResponse,
  PublicKeyCredentialWithAuthenticatorAttestationResponse as ClerkPublicKeyCredentialWithAuthenticatorAttestationResponse,
} from '@clerk/shared/types';

export type {
  PublicKeyCredentialRequestOptionsWithoutExtensions,
  PublicKeyCredentialCreationOptionsWithoutExtensions,
  CredentialReturn,
};

type AuthenticatorTransportFuture = 'ble' | 'cable' | 'hybrid' | 'internal' | 'nfc' | 'smart-card' | 'usb';

interface PublicKeyCredentialDescriptorJSON {
  id: string;
  type: PublicKeyCredentialType;
  transports?: AuthenticatorTransportFuture[];
}

// The serialized JSON to send to "create" native module
export type SerializedPublicKeyCredentialCreationOptions = Pick<
  PublicKeyCredentialCreationOptionsWithoutExtensions,
  'authenticatorSelection' | 'pubKeyCredParams'
> & {
  rp: { id: string; name: string };
  user: {
    id: string;
    displayName: string;
    name: string;
  };
  challenge: string;
  excludeCredentials?: PublicKeyCredentialDescriptorJSON[];
};

// The serialized JSON to send to "get" native module
export type SerializedPublicKeyCredentialRequestOptions = Omit<
  PublicKeyCredentialRequestOptionsWithoutExtensions,
  'challenge'
> & {
  challenge: string;
};

// The return type from the "get" native module.
export interface AuthenticationResponseJSON {
  id: string;
  rawId: string;
  response: AuthenticatorAssertionResponseJSON;
  authenticatorAttachment?: AuthenticatorAttachment;
  clientExtensionResults: AuthenticationExtensionsClientOutputs;
  type: PublicKeyCredentialType;
}

// The serialized response of the native module "create" response to be send back to clerk
export type PublicKeyCredentialWithAuthenticatorAttestationResponse =
  ClerkPublicKeyCredentialWithAuthenticatorAttestationResponse & {
    toJSON: () => any;
  };

interface AuthenticatorAssertionResponseJSON {
  clientDataJSON: string;
  authenticatorData: string;
  signature: string;
  userHandle?: string;
}

// The serialized response of the native module "get" response to be send back to clerk
export type PublicKeyCredentialWithAuthenticatorAssertionResponse =
  ClerkPublicKeyCredentialWithAuthenticatorAssertionResponse & {
    toJSON: () => any;
  };

interface AuthenticatorAttestationResponseJSON {
  clientDataJSON: string;
  attestationObject: string;
  authenticatorData?: string;
  transports?: AuthenticatorTransportFuture[];
  publicKeyAlgorithm?: COSEAlgorithmIdentifier;
  publicKey?: string;
}

// The type is returned from from native module "create" response
export interface RegistrationResponseJSON {
  id: string;
  rawId: string;
  response: AuthenticatorAttestationResponseJSON;
  authenticatorAttachment?: AuthenticatorAttachment;
  clientExtensionResults: AuthenticationExtensionsClientOutputs;
  type: PublicKeyCredentialType;
}
