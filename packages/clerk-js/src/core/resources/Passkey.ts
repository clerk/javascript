import type { PasskeyJSON, PasskeyResource, PasskeyVerificationResource } from '@clerk/types';

import { unixEpochToDate } from '../../utils/date';
import type { PublicKeyCredentialWithAuthenticatorAttestationResponse } from '../../utils/passkeys';
import {
  isWebAuthnPlatformAuthenticatorSupported,
  serializePublicKeyCredential,
  webAuthnCreateCredential,
} from '../../utils/passkeys';
import { BaseResource, ClerkRuntimeError, PasskeyVerification } from './internal';

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

  private static async prepareVerification(passkeyId: string) {
    return BaseResource._fetch({
      path: `/me/passkeys/${passkeyId}/prepare_verification`,
      method: 'POST',
    }).then(res => new Passkey(res?.response as PasskeyJSON));
  }

  private static async attemptVerification(
    passkeyId: string,
    credential: PublicKeyCredentialWithAuthenticatorAttestationResponse,
  ) {
    const jsonPublicKeyCredential = serializePublicKeyCredential(credential);
    return BaseResource._fetch({
      path: `/me/passkeys/${passkeyId}/attempt_verification`,
      method: 'POST',
      body: { publicKeyCredential: JSON.stringify(jsonPublicKeyCredential) } as any,
    }).then(res => new Passkey(res?.response as PasskeyJSON));
  }

  /**
   * TODO-PASSKEYS: Implement this later
   *
   * GET /v1/me/passkeys
   */
  static async get() {}

  /**
   * Developers should not be able to create a new Passkeys from an already instanced object
   */
  static async registerPasskey() {
    /**
     * The UI should always prevent from this method being called if WebAuthn is not supported.
     * As a precaution we need to check if WebAuthn is supported.
     */

    /**
     * TODO-PASSKEYS: First simply check if webauthn is supported and check for this only when
     * publicKey?.authenticatorSelection.authenticatorAttachment === 'platform'
     */
    if (!(await isWebAuthnPlatformAuthenticatorSupported())) {
      throw new ClerkRuntimeError('Platform authenticator is not supported', {
        code: 'passkeys_unsupported_platform_authenticator',
      });
    }

    const passkey = await this.create();

    const { verification } = await this.prepareVerification(passkey.id);

    const publicKey = verification?.publicKey;

    // This should never occur such a fail-safe
    if (!publicKey) {
      // TODO-PASSKEYS: Implement this later
      throw 'Missing key';
    }

    // Invoke the WebAuthn create() method.
    const { publicKeyCredential, error } = await webAuthnCreateCredential(publicKey);

    if (!publicKeyCredential) {
      throw error;
    }

    return this.attemptVerification(passkey.id, publicKeyCredential);
  }

  /**
   * TODO-PASSKEYS: Implement this later
   *
   * PATCH /v1/me/passkeys/{passkeyIdentificationID}
   */
  update = (): Promise<PasskeyResource> => this._basePatch();

  /**
   * TODO-PASSKEYS: Implement this later
   *
   * DELETE /v1/me/passkeys/{passkeyIdentificationID}
   */
  destroy = (): Promise<void> => this._baseDelete();

  /**
   * TODO-PASSKEYS: Implement this later
   *
   * GET /v1/me/passkeys/{passkeyIdentificationID}
   */
  reload = () => this._baseGet();

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
