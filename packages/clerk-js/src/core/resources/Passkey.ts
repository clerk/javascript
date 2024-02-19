import type { PasskeyJSON, PasskeyResource, PublicKeyOptions } from '@clerk/types';

import {
  base64UrlToBuffer,
  bufferToBase64Url,
  handlePublicKeyCreateError,
  isWebAuthnPlatformAuthenticatorSupported,
} from '../../utils/passkeys';
import { BaseResource, ClerkRuntimeError } from './internal';

export class Passkey extends BaseResource implements PasskeyResource {
  id!: string;
  pathRoot = '/me/passkeys';
  credentialId: string | null = null;
  publicKey: PublicKeyOptions = {};
  challenge: string = '';
  user!: PasskeyResource['user'];
  rp!: PasskeyResource['rp'];
  pubKeyCredParams!: PasskeyResource['pubKeyCredParams'];
  hints: PasskeyResource['hints'] = [];
  attestation = 'none' as const;
  authenticatorSelection: PasskeyResource['authenticatorSelection'] = {};
  excludeCredentials: PasskeyResource['excludeCredentials'] = [];

  public constructor(data: PasskeyJSON) {
    super();
    this.fromJSON(data);
  }

  private static async startRegistration() {
    return await BaseResource._fetch({
      path: `/me/passkeys`,
      method: 'POST',
    }).then(res => new Passkey(res?.response as PasskeyJSON));
  }

  private static async finishRegistration(publicKeyCredential: any) {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });
    return await BaseResource._fetch({
      path: `/me/passkeys/finalize`,
      method: 'POST',
      headers,
      body: JSON.stringify(publicKeyCredential) as any,
    }).then(res => new Passkey(res?.response as PasskeyJSON));
  }

  static async create() {
    /**
     * The UI should always prevent from this method being called if WebAuthn is not supported.
     * As a precaution we need to check if WebAuthn is supported.
     */

    if (!(await isWebAuthnPlatformAuthenticatorSupported())) {
      throw new ClerkRuntimeError('Platform authenticator is not supported', {
        code: 'passkeys_unsupported_platform_authenticator',
      });
    }
    const { publicKey: options } = await this.startRegistration();

    const userIdBuffer = base64UrlToBuffer(options.user.id as unknown as string);
    const challengeBuffer = base64UrlToBuffer(options.challenge as unknown as string);

    const excludeCredentialsWithBuffer = (options.excludeCredentials || []).map(cred => ({
      ...cred,
      id: base64UrlToBuffer(cred.id as unknown as string),
    }));

    const publicKey: PublicKeyOptions = {
      ...options,
      excludeCredentials: excludeCredentialsWithBuffer,
      challenge: challengeBuffer,
      user: {
        ...options.user,
        id: userIdBuffer,
      },
    };

    // Invoke the WebAuthn create() method.
    const { cred, error } = await navigator.credentials
      .create({
        publicKey,
      })
      .then(v => ({ cred: v as PublicKeyCredential, error: null }))
      .catch(e => ({ error: handlePublicKeyCreateError(e), cred: null }));

    if (!cred) {
      throw error;
    }

    const response = cred.response as AuthenticatorAttestationResponse;

    // Register the credential to the server endpoint.
    // TODO: Which of these do we actually need ?
    const credential = {
      type: cred.type,
      id: cred.id,
      rawId: bufferToBase64Url(cred.rawId),
      authenticatorAttachment: cred.authenticatorAttachment,
      response: {
        clientDataJSON: bufferToBase64Url(response.clientDataJSON),
        attestationObject: bufferToBase64Url(response.attestationObject),
        transports: response.getTransports(),
        // TODO: Do we need publicKey here ?
        // publicKey: response.getPublicKey(),
      },
    };

    return await this.finishRegistration(credential);
  }

  // create = (): Promise<this> =>
  //   this._basePost({
  //     body: { a },
  //   });

  // prepareVerification = (): Promise<PhoneNumberResource> => {
  //   return this._basePost<PhoneNumberJSON>({
  //     action: 'prepare_verification',
  //     body: { strategy: 'phone_code' },
  //   });
  // };
  //
  // attemptVerification = (params: AttemptPhoneNumberVerificationParams): Promise<PhoneNumberResource> => {
  //   const { code } = params || {};
  //   return this._basePost<PhoneNumberJSON>({
  //     action: 'attempt_verification',
  //     body: { code },
  //   });
  // };
  // setReservedForSecondFactor = (params: SetReservedForSecondFactorParams): Promise<PhoneNumberResource> => {
  //   const { reserved } = params || {};
  //   return this._basePatch<PhoneNumberJSON>({
  //     body: { reserved_for_second_factor: reserved },
  //   });
  // };
  //
  // makeDefaultSecondFactor = (): Promise<PhoneNumberResource> => {
  //   return this._basePatch<PhoneNumberJSON>({
  //     body: { default_second_factor: true },
  //   });
  // };

  rename = (): Promise<void> => this._baseDelete();

  destroy = (): Promise<void> => this._baseDelete();

  static fromJSON(data: PasskeyJSON): Passkey {
    return new Passkey(data);
  }

  protected fromJSON(data: PasskeyJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.credentialId = data.credential_id;
    this.publicKey = data.publicKey;
    this.challenge = data.challenge;
    this.user = {
      id: data.user_id,
      name: data.user_name,
      displayName: data.user_display_name,
    };
    this.rp = { id: data.rp_id };
    this.pubKeyCredParams = data.pub_key_cred_params;
    this.hints = data.hints;
    this.attestation = data.attestation;
    this.authenticatorSelection = data.authenticator_selection;
    this.excludeCredentials = data.exclude_credentials;
    return this;
  }
}
