import type { TrustedDeviceChallengeJSON, TrustedDeviceChallengeResource } from '@clerk/shared/types';

export function trustedDeviceChallengeFromJSON(
  data: TrustedDeviceChallengeJSON | null | undefined,
): TrustedDeviceChallengeResource | null {
  if (!data) {
    return null;
  }
  return {
    challenge: data.challenge,
    challengeId: data.challenge_id,
    trustedDeviceId: data.trusted_device_id ?? null,
    clientData: data.client_data,
    expiresAt: data.expires_at ? new Date(data.expires_at * 1000) : null,
    algorithm: data.algorithm,
  };
}

export function trustedDeviceChallengeToJSON(
  challenge: TrustedDeviceChallengeResource | null,
): TrustedDeviceChallengeJSON | null {
  if (!challenge) {
    return null;
  }
  return {
    object: 'trusted_device_challenge',
    challenge: challenge.challenge,
    challenge_id: challenge.challengeId,
    ...(challenge.trustedDeviceId ? { trusted_device_id: challenge.trustedDeviceId } : {}),
    client_data: challenge.clientData,
    expires_at: challenge.expiresAt ? Math.floor(challenge.expiresAt.getTime() / 1000) : 0,
    algorithm: challenge.algorithm,
  };
}
