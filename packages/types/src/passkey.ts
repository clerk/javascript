import type { DeletedObjectResource } from './deletedObject';
import type { PasskeyJSON } from './json';
import type { ClerkResource } from './resource';
import type { SnakeToCamel } from './utils';
import type { PasskeyVerificationResource } from './verification';

type UpdatePasskeyJSON = Pick<PasskeyJSON, 'name'>;

export type UpdatePasskeyParams = Partial<SnakeToCamel<UpdatePasskeyJSON>>;

export interface PasskeyResource extends ClerkResource {
  id: string;
  credentialId: string | null;
  name: string | null;
  verification: PasskeyVerificationResource | null;
  lastUsedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;

  update: (params: UpdatePasskeyParams) => Promise<PasskeyResource>;
  delete: () => Promise<DeletedObjectResource>;
}

/**
 * @experimental
 */
export type __experimental_PublicKeyCredentialCreationOptionsWithoutExtensions = Omit<
  Required<PublicKeyCredentialCreationOptions>,
  'extensions'
>;
/**
 * @experimental
 */
export type __experimental_PublicKeyCredentialRequestOptionsWithoutExtensions = Omit<
  Required<PublicKeyCredentialRequestOptions>,
  'extensions'
>;
/**
 * @experimental
 */
export type __experimental_PublicKeyCredentialWithAuthenticatorAttestationResponse = Omit<
  PublicKeyCredential,
  'response' | 'getClientExtensionResults'
> & {
  response: Omit<AuthenticatorAttestationResponse, 'getAuthenticatorData' | 'getPublicKey' | 'getPublicKeyAlgorithm'>;
};
/**
 * @experimental
 */
export type __experimental_PublicKeyCredentialWithAuthenticatorAssertionResponse = Omit<
  PublicKeyCredential,
  'response' | 'getClientExtensionResults'
> & {
  response: AuthenticatorAssertionResponse;
};
