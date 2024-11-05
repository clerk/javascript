import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  mockJwks,
  mockJwt,
  mockJwtHeader,
  mockJwtPayload,
  pemEncodedPublicKey,
  publicJwks,
  signedJwt,
  someOtherPublicKey,
} from '../../fixtures';
import { decodeJwt, hasValidSignature, verifyJwt } from '../verifyJwt';

const invalidTokenError = {
  reason: 'token-invalid',
  message: 'Invalid JWT form. A JWT consists of three parts separated by dots.',
};

describe('hasValidSignature(jwt, key)', () => {
  it('verifies the signature with a JWK formatted key', async () => {
    const { data: decodedResult } = decodeJwt(signedJwt);
    const { data: signatureResult } = decodedResult
      ? await hasValidSignature(decodedResult, publicJwks)
      : { data: false };

    expect(signatureResult).toBe(true);
  });

  it('verifies the signature with a PEM formatted key', async () => {
    const { data: decodedResult } = decodeJwt(signedJwt);
    const { data: signatureResult } = decodedResult
      ? await hasValidSignature(decodedResult, pemEncodedPublicKey)
      : { data: false };

    expect(signatureResult).toBe(true);
  });

  it('returns false if the key is not correct', async () => {
    const { data: decodedResult } = decodeJwt(signedJwt);
    const signatureResult = decodedResult
      ? await hasValidSignature(decodedResult, someOtherPublicKey)
      : { data: false };

    expect(signatureResult).toEqual({ data: false });
  });
});

describe('decodeJwt(jwt)', () => {
  it('decodes a valid JWT', () => {
    const { data } = decodeJwt(mockJwt);

    expect(data?.header).toEqual(mockJwtHeader);
    expect(data?.payload).toEqual(mockJwtPayload);
    // TODO: assert signature is instance of Uint8Array
  });

  it('returns an error if null is given as jwt', () => {
    const { errors: [error] = [] } = decodeJwt('null');
    expect(error).toMatchObject(invalidTokenError);
  });

  it('returns an error if undefined is given as jwt', () => {
    const { errors: [error] = [] } = decodeJwt('undefined');
    expect(error).toMatchObject(invalidTokenError);
  });

  it('returns an error if empty string is given as jwt', () => {
    const { errors: [error] = [] } = decodeJwt('');
    expect(error).toMatchObject(invalidTokenError);
  });

  it('throws an error if invalid string is given as jwt', () => {
    const { errors: [error] = [] } = decodeJwt('whatever');
    expect(error).toMatchObject(invalidTokenError);
  });

  it('throws an error if number is given as jwt', () => {
    const { errors: [error] = [] } = decodeJwt('42');
    expect(error).toMatchObject(invalidTokenError);
  });
});

describe('verifyJwt(jwt, options)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(mockJwtPayload.iat * 1000));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the valid JWT payload if valid key & issuer & azp is given', async () => {
    const inputVerifyJwtOptions = {
      key: mockJwks.keys[0],
      issuer: mockJwtPayload.iss,
      authorizedParties: ['https://accounts.inspired.puma-74.lcl.dev'],
    };
    const { data } = await verifyJwt(mockJwt, inputVerifyJwtOptions);
    expect(data).toEqual(mockJwtPayload);
  });

  it('returns the valid JWT payload if valid key & issuer method & azp is given', async () => {
    const inputVerifyJwtOptions = {
      key: mockJwks.keys[0],
      issuer: (iss: string) => iss.startsWith('https://clerk'),
      authorizedParties: ['https://accounts.inspired.puma-74.lcl.dev'],
    };
    const { data } = await verifyJwt(mockJwt, inputVerifyJwtOptions);
    expect(data).toEqual(mockJwtPayload);
  });

  it('returns the valid JWT payload if valid key & issuer & list of azp (with empty string) is given', async () => {
    const inputVerifyJwtOptions = {
      key: mockJwks.keys[0],
      issuer: mockJwtPayload.iss,
      authorizedParties: ['', 'https://accounts.inspired.puma-74.lcl.dev'],
    };
    const { data } = await verifyJwt(mockJwt, inputVerifyJwtOptions);
    expect(data).toEqual(mockJwtPayload);
  });

  it('returns the reason of the failure when verifications fail', async () => {
    const inputVerifyJwtOptions = {
      key: mockJwks.keys[0],
      issuer: mockJwtPayload.iss,
      authorizedParties: ['', 'https://accounts.inspired.puma-74.lcl.dev'],
    };
    const { errors: [error] = [] } = await verifyJwt('invalid-jwt', inputVerifyJwtOptions);
    expect(error).toMatchObject(invalidTokenError);
  });
});
