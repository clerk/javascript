import type {
  AttemptBiometricCredentialParams,
  BiometricCredentialJSON,
  BiometricCredentialJSONSnapshot,
  BiometricCredentialPlatform,
  BiometricCredentialResource,
  BiometricCredentialStatus,
  PrepareBiometricCredentialParams,
  TrustedDeviceAlgorithm,
  TrustedDeviceChallengeJSON,
  TrustedDeviceChallengeResource,
} from '@clerk/shared/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './internal';
import { trustedDeviceChallengeFromJSON } from './TrustedDeviceChallenge';

const PATH_ROOT = '/me/biometric_credentials';

function toEnrollmentBody(params: PrepareBiometricCredentialParams | AttemptBiometricCredentialParams) {
  const { publicKeyJwk, ...rest } = params;
  return {
    ...rest,
    publicKeyJwk: typeof publicKeyJwk === 'string' ? publicKeyJwk : JSON.stringify(publicKeyJwk),
  };
}

export class BiometricCredential extends BaseResource implements BiometricCredentialResource {
  id!: string;
  pathRoot = PATH_ROOT;
  platform!: BiometricCredentialPlatform;
  appIdentifier!: string;
  name: string | null = null;
  algorithm!: TrustedDeviceAlgorithm;
  status!: BiometricCredentialStatus;
  lastUsedAt: Date | null = null;
  revokedAt: Date | null = null;
  createdAt!: Date;
  updatedAt!: Date;

  public constructor(data: BiometricCredentialJSON | BiometricCredentialJSONSnapshot) {
    super();
    this.fromJSON(data);
  }

  static async list(): Promise<BiometricCredentialResource[]> {
    const json = (await BaseResource._fetch({ path: PATH_ROOT, method: 'GET' }))
      ?.response as unknown as BiometricCredentialJSON[];
    return (json || []).map(credential => new BiometricCredential(credential));
  }

  static async prepare(params: PrepareBiometricCredentialParams): Promise<TrustedDeviceChallengeResource> {
    const json = (
      await BaseResource._fetch({
        path: `${PATH_ROOT}/prepare`,
        method: 'POST',
        body: toEnrollmentBody(params) as any,
      })
    )?.response as unknown as TrustedDeviceChallengeJSON;
    return trustedDeviceChallengeFromJSON(json) as TrustedDeviceChallengeResource;
  }

  static async attempt(params: AttemptBiometricCredentialParams): Promise<BiometricCredentialResource> {
    const json = (
      await BaseResource._fetch({
        path: `${PATH_ROOT}/attempt`,
        method: 'POST',
        body: toEnrollmentBody(params) as any,
      })
    )?.response as unknown as BiometricCredentialJSON;
    return new BiometricCredential(json);
  }

  static async revoke(biometricCredentialId: string): Promise<BiometricCredentialResource> {
    const json = (
      await BaseResource._fetch({
        path: `${PATH_ROOT}/${biometricCredentialId}`,
        method: 'DELETE',
      })
    )?.response as unknown as BiometricCredentialJSON;
    return new BiometricCredential(json);
  }

  protected fromJSON(data: BiometricCredentialJSON | BiometricCredentialJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.platform = data.platform;
    this.appIdentifier = data.app_identifier;
    this.name = data.name ?? null;
    this.algorithm = data.algorithm;
    this.status = data.status;
    this.lastUsedAt = data.last_used_at ? unixEpochToDate(data.last_used_at) : null;
    this.revokedAt = data.revoked_at ? unixEpochToDate(data.revoked_at) : null;
    this.createdAt = unixEpochToDate(data.created_at);
    this.updatedAt = unixEpochToDate(data.updated_at);
    return this;
  }

  public __internal_toSnapshot(): BiometricCredentialJSONSnapshot {
    return {
      object: 'trusted_device',
      id: this.id,
      platform: this.platform,
      app_identifier: this.appIdentifier,
      name: this.name,
      algorithm: this.algorithm,
      status: this.status,
      last_used_at: this.lastUsedAt?.getTime() ?? null,
      revoked_at: this.revokedAt?.getTime() ?? null,
      created_at: this.createdAt.getTime(),
      updated_at: this.updatedAt.getTime(),
    };
  }
}
