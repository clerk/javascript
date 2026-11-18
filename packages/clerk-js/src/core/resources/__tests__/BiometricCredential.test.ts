import { stringifyQueryParams } from '@clerk/shared/internal/clerk-js/querystring';
import type { BiometricCredentialJSON, UserJSON } from '@clerk/shared/types';
import { camelToSnake } from '@clerk/shared/underscore';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BiometricCredential } from '../BiometricCredential';
import { BaseResource } from '../internal';
import { User } from '../User';

const credentialJSON: BiometricCredentialJSON = {
  object: 'trusted_device',
  id: 'td_123',
  platform: 'ios',
  app_identifier: 'com.example.app',
  name: 'iPhone',
  algorithm: 'ES256',
  status: 'active',
  created_at: 1_700_000_000_000,
  updated_at: 1_700_000_100_000,
  last_used_at: 1_700_000_200_000,
  revoked_at: null,
};

const publicKeyJwk = { kty: 'EC', crv: 'P-256', x: 'x_value', y: 'y_value' } as const;

const enrollmentParams = {
  platform: 'ios',
  appIdentifier: 'com.example.app',
  name: 'iPhone',
  algorithm: 'ES256',
  publicKeyJwk,
} as const;

const createUser = () =>
  new User({
    email_addresses: [],
    phone_numbers: [],
    web3_wallets: [],
    external_accounts: [],
  } as unknown as UserJSON);

const mockFetch = (response: unknown) => {
  const fetch = vi.fn().mockResolvedValue({ response });
  BaseResource._fetch = fetch;
  return fetch;
};

describe('BiometricCredential', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('parses the credential JSON', () => {
    const credential = new BiometricCredential(credentialJSON);

    expect(credential.id).toBe('td_123');
    expect(credential.pathRoot).toBe('/me/biometric_credentials');
    expect(credential.platform).toBe('ios');
    expect(credential.appIdentifier).toBe('com.example.app');
    expect(credential.name).toBe('iPhone');
    expect(credential.algorithm).toBe('ES256');
    expect(credential.status).toBe('active');
    expect(credential.createdAt).toEqual(new Date(1_700_000_000_000));
    expect(credential.updatedAt).toEqual(new Date(1_700_000_100_000));
    expect(credential.lastUsedAt).toEqual(new Date(1_700_000_200_000));
    expect(credential.revokedAt).toBeNull();
  });

  it('round-trips through the snapshot', () => {
    const snapshot = new BiometricCredential(credentialJSON).__internal_toSnapshot();

    expect(snapshot).toEqual(credentialJSON);
  });

  describe('User experimental methods', () => {
    it('lists biometric credentials', async () => {
      const fetch = mockFetch([credentialJSON]);

      const credentials = await createUser().__experimental_getBiometricCredentials();

      expect(fetch).toHaveBeenCalledWith({ path: '/me/biometric_credentials', method: 'GET' });
      expect(credentials).toHaveLength(1);
      expect(credentials[0]).toBeInstanceOf(BiometricCredential);
      expect(credentials[0].id).toBe('td_123');
    });

    it('prepares a biometric credential and returns the challenge', async () => {
      const fetch = mockFetch({
        object: 'trusted_device_challenge',
        challenge: 'challenge_value',
        challenge_id: 'tdch_123',
        client_data: 'client_data_value',
        expires_at: 1_700_000_300,
        algorithm: 'ES256',
      });

      const challenge = await createUser().__experimental_prepareBiometricCredential(enrollmentParams);

      expect(fetch).toHaveBeenCalledWith({
        path: '/me/biometric_credentials/prepare',
        method: 'POST',
        body: { ...enrollmentParams, publicKeyJwk: JSON.stringify(publicKeyJwk) },
      });
      expect(challenge).toEqual({
        challenge: 'challenge_value',
        challengeId: 'tdch_123',
        trustedDeviceId: null,
        clientData: 'client_data_value',
        expiresAt: new Date(1_700_000_300_000),
        algorithm: 'ES256',
      });
    });

    it('attempts a biometric credential enrollment', async () => {
      const fetch = mockFetch(credentialJSON);
      const serializedJwk = JSON.stringify(publicKeyJwk);

      const credential = await createUser().__experimental_attemptBiometricCredential({
        ...enrollmentParams,
        publicKeyJwk: serializedJwk,
        clientData: 'client_data_value',
        signature: 'signature_value',
      });

      const body = fetch.mock.calls[0][0].body;
      expect(fetch).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/me/biometric_credentials/attempt', method: 'POST' }),
      );
      expect(Object.fromEntries(new URLSearchParams(stringifyQueryParams(body, { keyEncoder: camelToSnake })))).toEqual(
        {
          platform: 'ios',
          app_identifier: 'com.example.app',
          name: 'iPhone',
          algorithm: 'ES256',
          public_key_jwk: serializedJwk,
          client_data: 'client_data_value',
          signature: 'signature_value',
        },
      );
      expect(credential.id).toBe('td_123');
    });

    it('revokes a biometric credential', async () => {
      const fetch = mockFetch({ ...credentialJSON, status: 'revoked', revoked_at: 1_700_000_400_000 });

      const credential = await createUser().__experimental_revokeBiometricCredential('td_123');

      expect(fetch).toHaveBeenCalledWith({ path: '/me/biometric_credentials/td_123', method: 'DELETE' });
      expect(credential.status).toBe('revoked');
      expect(credential.revokedAt).toEqual(new Date(1_700_000_400_000));
    });
  });
});
