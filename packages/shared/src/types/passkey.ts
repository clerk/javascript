import type { DeletedObjectResource } from './deletedObject';
import type { PasskeyJSON } from './json';
import type { ClerkResource } from './resource';
import type { PasskeyJSONSnapshot } from './snapshots';
import type { SnakeToCamel } from './utils';
import type { PasskeyVerificationResource } from './verification';

type UpdatePasskeyJSON = Pick<PasskeyJSON, 'name'>;

export type UpdatePasskeyParams = Partial<SnakeToCamel<UpdatePasskeyJSON>>;

export interface PasskeyResource extends ClerkResource {
  id: string;
  name: string | null;
  verification: PasskeyVerificationResource | null;
  lastUsedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;

  update: (params: UpdatePasskeyParams) => Promise<PasskeyResource>;
  delete: () => Promise<DeletedObjectResource>;
  __internal_toSnapshot: () => PasskeyJSONSnapshot;
}

export type PublicKeyCredentialCreationOptionsWithoutExtensions = Omit<
  Required<PublicKeyCredentialCreationOptions>,
  'extensions'
>;

export type PublicKeyCredentialRequestOptionsWithoutExtensions = Omit<
  Required<PublicKeyCredentialRequestOptions>,
  'extensions'
>;

export type PublicKeyCredentialWithAuthenticatorAttestationResponse = Omit<
  PublicKeyCredential,
  'response' | 'getClientExtensionResults'
> & {
  response: Omit<AuthenticatorAttestationResponse, 'getAuthenticatorData' | 'getPublicKey' | 'getPublicKeyAlgorithm'>;
};

export type PublicKeyCredentialWithAuthenticatorAssertionResponse = Omit<
  PublicKeyCredential,
  'response' | 'getClientExtensionResults'
> & {
  response: AuthenticatorAssertionResponse;
};

export type CredentialReturn<T> =
  | {
      publicKeyCredential: T;
      error: null;
    }
  | {
      publicKeyCredential: null;
      error: Error;
    };
