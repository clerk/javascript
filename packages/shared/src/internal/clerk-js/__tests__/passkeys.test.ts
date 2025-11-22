import { describe, expect, it } from 'vitest';

import type {
  PublicKeyCredentialWithAuthenticatorAssertionResponse,
  PublicKeyCredentialWithAuthenticatorAttestationResponse,
} from '@/types';

import {
  bufferToBase64Url,
  convertJSONToPublicKeyCreateOptions,
  convertJSONToPublicKeyRequestOptions,
  serializePublicKeyCredential,
  serializePublicKeyCredentialAssertion,
} from '../passkeys';

describe('Passkey utils', () => {
  describe('serialization', () => {
    it('convertJSONToPublicKeyCreateOptions()', () => {
      const pkCreateOptions = {
        rp: {
          name: 'clerk.com',
          id: 'clerk.com',
        },
        user: {
          name: 'clerkUser',
          displayName: 'Clerk User',
          id: 'dXNlcl8xMjM', // user_123 encoded as base64url
        },
        excludeCredentials: [
          {
            type: 'public-key' as const,
            id: 'cmFuZG9tX2lk',
          },
        ],
        authenticatorSelection: {
          requireResidentKey: true,
          residentKey: 'required' as const,
          userVerification: 'required' as const,
        },
        attestation: 'none' as const,
        pubKeyCredParams: [
          {
            type: 'public-key' as const,
            alg: -7,
          },
        ],
        timeout: 10000,
        challenge: 'Y2hhbGxlbmdlXzEyMw', // challenge_123 encoded as base64url
      };

      const result = convertJSONToPublicKeyCreateOptions(pkCreateOptions);

      expect(result.rp).toEqual({
        name: 'clerk.com',
        id: 'clerk.com',
      });

      expect(result.attestation).toEqual('none');
      expect(result.authenticatorSelection).toEqual({
        requireResidentKey: true,
        residentKey: 'required',
        userVerification: 'required',
      });

      expect(bufferToBase64Url(result.user.id as ArrayBuffer)).toEqual(pkCreateOptions.user.id);

      expect(bufferToBase64Url(result.excludeCredentials[0].id as ArrayBuffer)).toEqual(
        pkCreateOptions.excludeCredentials[0].id,
      );
    });

    it('convertJSONToPublicKeyCreateOptions()', () => {
      const pkCreateOptions = {
        rpId: 'clerk.com',
        allowCredentials: [
          {
            type: 'public-key' as const,
            id: 'cmFuZG9tX2lk',
          },
        ],
        userVerification: 'required' as const,
        timeout: 10000,
        challenge: 'Y2hhbGxlbmdlXzEyMw', // challenge_123 encoded as base64url
      };

      const result = convertJSONToPublicKeyRequestOptions(pkCreateOptions);

      expect(result.rpId).toEqual('clerk.com');
      expect(result.userVerification).toEqual('required');
      expect(bufferToBase64Url(result.allowCredentials[0].id as ArrayBuffer)).toEqual(
        pkCreateOptions.allowCredentials[0].id,
      );
    });

    it('serializePublicKeyCredential()', () => {
      const publicKeyCredential = {
        type: 'public-key' as const,
        id: 'credentialId_123',
        rawId: new Uint8Array([99, 114, 101, 100, 101, 110, 116, 105, 97, 108, 73, 100, 95, 49, 50, 51]),
        authenticatorAttachment: 'cross-platform' as AuthenticatorAttachment,
        response: {
          clientDataJSON: new Uint8Array([110, 116, 105, 97]),
          attestationObject: new Uint8Array([108, 73, 100, 95, 49]),
          getTransports: () => ['usb'] as AuthenticatorTransport[],
        },
      } as any as PublicKeyCredentialWithAuthenticatorAttestationResponse;

      const result = serializePublicKeyCredential(publicKeyCredential);

      expect(result.type).toEqual('public-key');
      expect(result.id).toEqual('credentialId_123');
      expect(result.rawId).toEqual('Y3JlZGVudGlhbElkXzEyMw');

      expect(result.response.clientDataJSON).toEqual('bnRpYQ');
      expect(result.response.attestationObject).toEqual('bElkXzE');
      expect(result.response.transports).toEqual(['usb']);
    });

    it('serializePublicKeyCredentialAssertion()', () => {
      const publicKeyCredential = {
        type: 'public-key' as const,
        id: 'credentialId_123',
        rawId: new Uint8Array([99, 114, 101, 100, 101, 110, 116, 105, 97, 108, 73, 100, 95, 49, 50, 51]),
        authenticatorAttachment: 'cross-platform' as AuthenticatorAttachment,
        response: {
          clientDataJSON: new Uint8Array([110, 116, 105, 97]),
          signature: new Uint8Array([108, 73, 100, 95, 49]),
          authenticatorData: new Uint8Array([108, 73, 100, 95, 49]),
          userHandle: null,
        },
      } as any as PublicKeyCredentialWithAuthenticatorAssertionResponse;

      const result = serializePublicKeyCredentialAssertion(publicKeyCredential);

      expect(result.type).toEqual('public-key');
      expect(result.id).toEqual('credentialId_123');
      expect(result.rawId).toEqual('Y3JlZGVudGlhbElkXzEyMw');

      expect(result.response.clientDataJSON).toEqual('bnRpYQ');
      expect(result.response.signature).toEqual('bElkXzE');
      expect(result.response.userHandle).toEqual(null);
    });
  });
});
