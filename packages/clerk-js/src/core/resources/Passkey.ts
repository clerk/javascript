import type {
  __experimental_PublicKeyCredentialWithAuthenticatorAttestationResponse,
  DeletedObjectJSON,
  DeletedObjectResource,
  PasskeyJSON,
  PasskeyResource,
  PasskeyVerificationResource,
  UpdatePasskeyParams,
} from '@clerk/types';

import { unixEpochToDate } from '../../utils/date';
import {
  isWebAuthnPlatformAuthenticatorSupported,
  isWebAuthnSupported,
  serializePublicKeyCredential,
  webAuthnCreateCredential,
} from '../../utils/passkeys';
import { BaseResource, ClerkRuntimeError, DeletedObject, PasskeyVerification } from './internal';

export class Passkey extends BaseResource implements PasskeyResource {
  id!: string;
  pathRoot = '/me/passkeys';
  credentialId: string | null = null;
  verification: PasskeyVerificationResource | null = null;
  name: string | null = null;
  lastUsedAt: Date | null = null;
  createdAt!: Date;
  updatedAt!: Date;

  public constructor(data: PasskeyJSON) {
    super();
    this.fromJSON(data);
  }

  private static async create() {
    return BaseResource._fetch({
      path: `/me/passkeys`,
      method: 'POST',
    }).then(res => new Passkey(res?.response as PasskeyJSON));
  }

  private static async attemptVerification(
    passkeyId: string,
    credential: __experimental_PublicKeyCredentialWithAuthenticatorAttestationResponse,
  ) {
    const jsonPublicKeyCredential = serializePublicKeyCredential(credential);
    return BaseResource._fetch({
      path: `/me/passkeys/${passkeyId}/attempt_verification`,
      method: 'POST',
      body: { strategy: 'passkey', publicKeyCredential: JSON.stringify(jsonPublicKeyCredential) } as any,
    }).then(res => new Passkey(res?.response as PasskeyJSON));
  }

  /**
   * Developers should not be able to create a new Passkeys from an already instanced object
   */
  static async registerPasskey() {
    /**
     * The UI should always prevent from this method being called if WebAuthn is not supported.
     * As a precaution we need to check if WebAuthn is supported.
     */
    if (!isWebAuthnSupported()) {
      throw new ClerkRuntimeError('Passkeys are not supported', {
        code: 'passkeys_unsupported',
      });
    }

    const passkey = await this.create();

    const { verification } = passkey;

    const publicKey = verification?.publicKey;

    // This should never occur, just a fail-safe
    if (!publicKey) {
      // TODO-PASSKEYS: Implement this later
      throw 'Missing key';
    }

    if (publicKey.authenticatorSelection?.authenticatorAttachment === 'platform') {
      if (!(await isWebAuthnPlatformAuthenticatorSupported())) {
        throw new ClerkRuntimeError('Platform authenticator is not supported', {
          code: 'passkeys_unsupported_platform_authenticator',
        });
      }
    }

    // Invoke the WebAuthn create() method.
    const { publicKeyCredential, error } = await webAuthnCreateCredential(publicKey);

    if (!publicKeyCredential) {
      throw error;
    }

    return this.attemptVerification(passkey.id, publicKeyCredential);
  }

  /**
   * PATCH /v1/me/passkeys/{passkeyIdentificationID}
   */
  update = (params: UpdatePasskeyParams): Promise<PasskeyResource> =>
    this._basePatch({
      body: params,
    });

  /**
   * DELETE /v1/me/passkeys/{passkeyIdentificationID}
   */
  delete = async (): Promise<DeletedObjectResource> => {
    const json = (
      await BaseResource._fetch<DeletedObjectJSON>({
        path: this.path(),
        method: 'DELETE',
      })
    )?.response as unknown as DeletedObjectJSON;

    return new DeletedObject(json);
  };

  protected fromJSON(data: PasskeyJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.credentialId = data.credential_id;
    this.name = data.name;
    this.lastUsedAt = data.last_used_at ? unixEpochToDate(data.last_used_at) : null;
    this.createdAt = unixEpochToDate(data.created_at);
    this.updatedAt = unixEpochToDate(data.updated_at);

    if (data.verification) {
      this.verification = new PasskeyVerification(data.verification);
    }
    return this;
  }
}
