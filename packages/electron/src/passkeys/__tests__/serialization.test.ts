import type {
  PublicKeyCredentialCreationOptionsWithoutExtensions,
  PublicKeyCredentialRequestOptionsWithoutExtensions,
} from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import type { AuthenticationResponseJSON, RegistrationResponseJSON } from '../../shared/types';
import {
  deserializeCreationResponse,
  deserializeRequestResponse,
  serializeCreationOptions,
  serializeRequestOptions,
} from '../shared/serialization';

const bytes = (...values: number[]) => new Uint8Array(values).buffer;

// 'hello' in base64url
const HELLO_B64URL = 'aGVsbG8';
const helloBuffer = () => new TextEncoder().encode('hello').buffer as ArrayBuffer;

describe('serializeCreationOptions', () => {
  const options: PublicKeyCredentialCreationOptionsWithoutExtensions = {
    rp: { id: 'example.com', name: 'Example' },
    user: { id: helloBuffer(), name: 'jdoe', displayName: 'J Doe' },
    challenge: bytes(1, 2, 3, 250),
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
    timeout: 60_000,
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      requireResidentKey: true,
      residentKey: 'required',
      userVerification: 'required',
    },
    attestation: 'none',
    excludeCredentials: [{ type: 'public-key', id: bytes(9, 9), transports: ['internal'] }],
  };

  it('encodes binary fields as base64url and preserves the rest', () => {
    const serialized = serializeCreationOptions(options);

    expect(serialized).toEqual({
      rp: { id: 'example.com', name: 'Example' },
      user: { id: HELLO_B64URL, name: 'jdoe', displayName: 'J Doe' },
      challenge: 'AQID-g',
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      timeout: 60_000,
      authenticatorSelection: options.authenticatorSelection,
      attestation: 'none',
      excludeCredentials: [{ type: 'public-key', id: 'CQk', transports: ['internal'] }],
    });
  });

  it('accepts typed-array views over buffers', () => {
    const serialized = serializeCreationOptions({
      ...options,
      challenge: new Uint8Array([1, 2, 3, 250]),
    });
    expect(serialized.challenge).toBe('AQID-g');
  });

  it('survives a JSON round trip (IPC structured clone safety)', () => {
    const serialized = serializeCreationOptions(options);
    expect(JSON.parse(JSON.stringify(serialized))).toEqual(serialized);
  });
});

describe('serializeRequestOptions', () => {
  const options: PublicKeyCredentialRequestOptionsWithoutExtensions = {
    challenge: bytes(1, 2, 3, 250),
    rpId: 'example.com',
    timeout: 60_000,
    userVerification: 'required',
    allowCredentials: [{ type: 'public-key', id: bytes(9, 9) }],
  };

  it('encodes binary fields as base64url', () => {
    expect(serializeRequestOptions(options)).toEqual({
      challenge: 'AQID-g',
      rpId: 'example.com',
      timeout: 60_000,
      userVerification: 'required',
      allowCredentials: [{ type: 'public-key', id: 'CQk' }],
    });
  });
});

describe('deserializeCreationResponse', () => {
  const json: RegistrationResponseJSON = {
    id: HELLO_B64URL,
    rawId: HELLO_B64URL,
    type: 'public-key',
    authenticatorAttachment: 'platform',
    response: {
      clientDataJSON: HELLO_B64URL,
      attestationObject: HELLO_B64URL,
      transports: ['internal', 'hybrid'],
    },
  };

  it('decodes base64url fields into ArrayBuffers', () => {
    const credential = deserializeCreationResponse(json);

    expect(credential.id).toBe(HELLO_B64URL);
    expect(new TextDecoder().decode(credential.rawId)).toBe('hello');
    expect(new TextDecoder().decode(credential.response.clientDataJSON)).toBe('hello');
    expect(new TextDecoder().decode(credential.response.attestationObject)).toBe('hello');
    expect(credential.response.getTransports()).toEqual(['internal', 'hybrid']);
    expect(credential.authenticatorAttachment).toBe('platform');
  });

  it('exposes the original JSON via toJSON', () => {
    expect(deserializeCreationResponse(json).toJSON()).toBe(json);
  });

  it('defaults authenticatorAttachment to null and transports to []', () => {
    const credential = deserializeCreationResponse({
      ...json,
      authenticatorAttachment: undefined,
      response: { clientDataJSON: HELLO_B64URL, attestationObject: HELLO_B64URL },
    });
    expect(credential.authenticatorAttachment).toBeNull();
    expect(credential.response.getTransports()).toEqual([]);
  });
});

describe('deserializeRequestResponse', () => {
  const json: AuthenticationResponseJSON = {
    id: HELLO_B64URL,
    rawId: HELLO_B64URL,
    type: 'public-key',
    authenticatorAttachment: 'platform',
    response: {
      clientDataJSON: HELLO_B64URL,
      authenticatorData: HELLO_B64URL,
      signature: HELLO_B64URL,
      userHandle: HELLO_B64URL,
    },
  };

  it('decodes base64url fields into ArrayBuffers', () => {
    const credential = deserializeRequestResponse(json);

    expect(new TextDecoder().decode(credential.rawId)).toBe('hello');
    expect(new TextDecoder().decode(credential.response.authenticatorData)).toBe('hello');
    expect(new TextDecoder().decode(credential.response.signature)).toBe('hello');
    expect(new TextDecoder().decode(credential.response.userHandle as ArrayBuffer)).toBe('hello');
    expect(credential.toJSON()).toBe(json);
  });

  it('maps a missing userHandle to null', () => {
    const credential = deserializeRequestResponse({
      ...json,
      response: { ...json.response, userHandle: undefined },
    });
    expect(credential.response.userHandle).toBeNull();
  });
});
