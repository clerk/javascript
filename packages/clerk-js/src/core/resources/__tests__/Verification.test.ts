import type { VerificationJSON } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { Verification } from '../Verification';

const trustedDeviceVerificationJSON = {
  object: 'verification_trusted_device',
  id: '',
  status: 'unverified',
  strategy: 'trusted_device',
  attempts: 0,
  expire_at: 1_700_000_600_000,
  verified_at_client: '',
  error: null,
  trusted_device_challenge: {
    object: 'trusted_device_challenge',
    challenge: 'challenge_value',
    challenge_id: 'tdch_123',
    trusted_device_id: 'td_123',
    client_data: 'client_data_value',
    expires_at: 1_700_000_300,
    algorithm: 'ES256',
  },
} as unknown as VerificationJSON;

describe('Verification', () => {
  it('parses a trusted device challenge', () => {
    const verification = new Verification(trustedDeviceVerificationJSON);

    expect(verification.strategy).toBe('trusted_device');
    expect(verification.trustedDeviceChallenge).toEqual({
      challenge: 'challenge_value',
      challengeId: 'tdch_123',
      trustedDeviceId: 'td_123',
      clientData: 'client_data_value',
      expiresAt: new Date(1_700_000_300_000),
      algorithm: 'ES256',
    });
  });

  it('round-trips a trusted device challenge through the snapshot', () => {
    const snapshot = new Verification(trustedDeviceVerificationJSON).__internal_toSnapshot();

    expect(snapshot.trusted_device_challenge).toEqual(trustedDeviceVerificationJSON.trusted_device_challenge);
    expect(new Verification(snapshot).trustedDeviceChallenge).toEqual(
      new Verification(trustedDeviceVerificationJSON).trustedDeviceChallenge,
    );
  });

  it('parses an enrollment challenge without a trusted device id', () => {
    const verification = new Verification({
      ...trustedDeviceVerificationJSON,
      trusted_device_challenge: {
        object: 'trusted_device_challenge',
        challenge: 'challenge_value',
        challenge_id: 'tdch_123',
        client_data: 'client_data_value',
        expires_at: 1_700_000_300,
        algorithm: 'ES256',
      },
    });

    expect(verification.trustedDeviceChallenge?.trustedDeviceId).toBeNull();
    expect(verification.__internal_toSnapshot().trusted_device_challenge).not.toHaveProperty('trusted_device_id');
  });

  it('defaults to a null trusted device challenge and omits it from the snapshot', () => {
    const { trusted_device_challenge: _, ...json } = trustedDeviceVerificationJSON;
    const verification = new Verification(json as VerificationJSON);

    expect(verification.trustedDeviceChallenge).toBeNull();
    expect(new Verification(null).trustedDeviceChallenge).toBeNull();
    expect(verification.__internal_toSnapshot()).not.toHaveProperty('trusted_device_challenge');
  });
});
