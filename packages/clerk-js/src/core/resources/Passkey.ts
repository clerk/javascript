import type { PasskeyJSON, PasskeyResource, PublicKeyOptions } from '@clerk/types';

import { isSupportedPasskeysSupported } from '../../utils/passkeys';
import { BaseResource } from './internal';

// Move this somewhere else
class Base64Converter {
  static encode(buffer: ArrayBuffer): string {
    const binary = new Uint8Array(buffer);
    let base64 = '';
    binary.forEach(byte => {
      base64 += String.fromCharCode(byte);
    });
    return btoa(base64);
  }

  static decode(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

export class Passkey extends BaseResource implements PasskeyResource {
  id!: string;
  pathRoot = '/me/passkeys';
  credentialId: string | null = null;
  publicKey: string | null = null;
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

  static async isSupported() {
    return isSupportedPasskeysSupported();
  }

  private static async startRegistration() {
    return await BaseResource._fetch({
      path: `/me/passkeys`,
      method: 'POST',
    }).then(res => new Passkey(res?.response as PasskeyJSON));
  }

  private static async finishRegistration(publicKeyCredential: any) {
    return await BaseResource._fetch({
      path: `/me/passkeys/finalize`,
      method: 'POST',
      body: { publicKeyCredential } as any,
    }).then(res => new Passkey(res?.response as PasskeyJSON));
  }

  static async create() {
    const options = await this.startRegistration();

    const userIdBuffer = Base64Converter.decode(options.user.id);
    const challengeBuffer = Base64Converter.decode(options.challenge);

    const excludeCredentialsWithBuffer = (options.excludeCredentials || []).map(cred => ({
      ...cred,
      id: Base64Converter.decode(cred.id),
    }));

    // Use platform authenticator and discoverable credential.
    options.authenticatorSelection = {
      authenticatorAttachment: 'platform',
      requireResidentKey: true,
    };

    const publicKey: PublicKeyOptions = {
      ...options,
      excludeCredentials: excludeCredentialsWithBuffer,
      challenge: challengeBuffer,
      user: {
        ...options.user,
        id: userIdBuffer,
      },
      rp: {
        id: options.rp.id,
        name: options.rp.id,
      },
    };

    // Invoke the WebAuthn create() method.
    const cred = (await navigator.credentials.create({
      publicKey,
    })) as PublicKeyCredential;

    const response = cred.response as AuthenticatorAttestationResponse;

    // Register the credential to the server endpoint.
    const credential = {
      ...cred,
      response: {
        clientDataJSON: Base64Converter.encode(response.clientDataJSON),
        attestationObject: Base64Converter.encode(response.attestationObject),
        transports: response.getTransports(),
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
    this.publicKey = data.public_key;
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
