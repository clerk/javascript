import type { ClerkResource } from './resource';
import type { BiometricCredentialJSONSnapshot } from './snapshots';

/**
 * The signing algorithm used by trusted device (biometric) credentials.
 * @experimental
 */
export type TrustedDeviceAlgorithm = 'ES256';

/**
 * The native platform a biometric credential was enrolled on.
 * @experimental
 */
export type BiometricCredentialPlatform = 'ios' | 'android';

/**
 * @experimental
 */
export type BiometricCredentialStatus = 'active' | 'revoked';

/**
 * A P-256 public key in JWK format.
 * @experimental
 */
export type BiometricCredentialPublicKeyJWK = {
  kty: 'EC';
  crv: 'P-256';
  x: string;
  y: string;
};

/**
 * A challenge issued by Clerk that must be signed with the device's private key.
 * @experimental
 */
export interface TrustedDeviceChallengeResource {
  challenge: string;
  challengeId: string;
  /**
   * The ID of the trusted device the challenge was issued for. Only present on sign-in and session reverification challenges.
   */
  trustedDeviceId: string | null;
  /**
   * The exact string that must be signed by the device's private key.
   */
  clientData: string;
  expiresAt: Date | null;
  algorithm: TrustedDeviceAlgorithm;
}

/**
 * A biometric credential (trusted device) enrolled by the current user on a native device.
 * @experimental This is an experimental API for native apps and is subject to change.
 */
export interface BiometricCredentialResource extends ClerkResource {
  id: string;
  platform: BiometricCredentialPlatform;
  appIdentifier: string;
  name: string | null;
  algorithm: TrustedDeviceAlgorithm;
  status: BiometricCredentialStatus;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  __internal_toSnapshot: () => BiometricCredentialJSONSnapshot;
}

/**
 * @experimental
 */
export type PrepareBiometricCredentialParams = {
  platform: BiometricCredentialPlatform;
  /**
   * The iOS bundle identifier or Android package name of the app.
   */
  appIdentifier: string;
  name?: string;
  algorithm: TrustedDeviceAlgorithm;
  /**
   * The device public key as a JWK, or its JSON string.
   */
  publicKeyJwk: BiometricCredentialPublicKeyJWK | string;
};

/**
 * @experimental
 */
export type AttemptBiometricCredentialParams = PrepareBiometricCredentialParams & {
  /**
   * The `clientData` string from the challenge returned by the prepare step.
   */
  clientData: string;
  /**
   * The base64url-encoded raw (r||s) signature of `clientData`.
   */
  signature: string;
};
