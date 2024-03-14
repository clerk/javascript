import type {
  type __experimental_PublicKeyCredentialWithAuthenticatorAssertionResponse,
  type __experimental_PublicKeyCredentialWithAuthenticatorAttestationResponse,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@clerk/types';

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
      const pkCreateOptions: PublicKeyCredentialCreationOptionsJSON = {
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
            type: 'public-key',
            id: 'cmFuZG9tX2lk',
          },
        ],
        authenticatorSelection: {
          requireResidentKey: true,
          residentKey: 'required',
          userVerification: 'required',
        },
        attestation: 'none',
        pubKeyCredParams: [
          {
            type: 'public-key',
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

      expect(bufferToBase64Url(result.user.id)).toEqual(pkCreateOptions.user.id);

      expect(bufferToBase64Url(result.excludeCredentials[0].id)).toEqual(pkCreateOptions.excludeCredentials[0].id);
    });

    it('convertJSONToPublicKeyCreateOptions()', () => {
      const pkCreateOptions: PublicKeyCredentialRequestOptionsJSON = {
        rpId: 'clerk.com',
        allowCredentials: [
          {
            type: 'public-key',
            id: 'cmFuZG9tX2lk',
          },
        ],
        userVerification: 'required',
        timeout: 10000,
        challenge: 'Y2hhbGxlbmdlXzEyMw', // challenge_123 encoded as base64url
      };

      const result = convertJSONToPublicKeyRequestOptions(pkCreateOptions);

      expect(result.rpId).toEqual('clerk.com');
      expect(result.userVerification).toEqual('required');
      expect(bufferToBase64Url(result.allowCredentials[0].id)).toEqual(pkCreateOptions.allowCredentials[0].id);
    });

    it('serializePublicKeyCredential()', () => {
      const publicKeyCredential: __experimental_PublicKeyCredentialWithAuthenticatorAttestationResponse = {
        type: 'public-key',
        id: 'credentialId_123',
        rawId: new Uint8Array([99, 114, 101, 100, 101, 110, 116, 105, 97, 108, 73, 100, 95, 49, 50, 51]),
        authenticatorAttachment: 'cross-platform',
        response: {
          clientDataJSON: new Uint8Array([110, 116, 105, 97]),
          attestationObject: new Uint8Array([108, 73, 100, 95, 49]),
          getTransports: () => ['usb'],
        },
      };

      const result = serializePublicKeyCredential(publicKeyCredential);

      expect(result.type).toEqual('public-key');
      expect(result.id).toEqual('credentialId_123');
      expect(result.rawId).toEqual('Y3JlZGVudGlhbElkXzEyMw');

      expect(result.response.clientDataJSON).toEqual('bnRpYQ');
      expect(result.response.attestationObject).toEqual('bElkXzE');
      expect(result.response.transports).toEqual(['usb']);
    });

    it('serializePublicKeyCredentialAssertion()', () => {
      const publicKeyCredential: __experimental_PublicKeyCredentialWithAuthenticatorAssertionResponse = {
        type: 'public-key',
        id: 'credentialId_123',
        rawId: new Uint8Array([99, 114, 101, 100, 101, 110, 116, 105, 97, 108, 73, 100, 95, 49, 50, 51]),
        authenticatorAttachment: 'cross-platform',
        response: {
          clientDataJSON: new Uint8Array([110, 116, 105, 97]),
          signature: new Uint8Array([108, 73, 100, 95, 49]),
          authenticatorData: new Uint8Array([108, 73, 100, 95, 49]),
          userHandle: null,
        },
      };

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
