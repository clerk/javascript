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
import { decodeJwt, hasValidSignature, isJwtFormat, JwtFormatRegExp, verifyJwt } from '../verifyJwt';

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

describe('JwtFormatRegExp', () => {
  describe('valid JWT formats', () => {
    it('matches a standard JWT', () => {
      const jwt =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      expect(JwtFormatRegExp.test(jwt)).toBe(true);
    });

    it('matches a JWT with underscores', () => {
      const jwt =
        'eyJhbGci_iJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      expect(JwtFormatRegExp.test(jwt)).toBe(true);
    });

    it('matches a JWT with hyphens', () => {
      const jwt =
        'eyJhbGci-iJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      expect(JwtFormatRegExp.test(jwt)).toBe(true);
    });

    it('matches a JWT with very long parts', () => {
      const jwt = 'a'.repeat(100) + '.' + 'b'.repeat(200) + '.' + 'c'.repeat(50);
      expect(JwtFormatRegExp.test(jwt)).toBe(true);
    });

    it('matches a JWT with minimal parts (1 char each)', () => {
      const jwt = 'a.b.c';
      expect(JwtFormatRegExp.test(jwt)).toBe(true);
    });
  });

  describe('invalid JWT formats', () => {
    it('does not match empty string', () => {
      expect(JwtFormatRegExp.test('')).toBe(false);
    });

    it('does not match with only 2 parts', () => {
      const notJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0';
      expect(JwtFormatRegExp.test(notJwt)).toBe(false);
    });

    it('does not match with 4 parts', () => {
      const notJwt = 'part1.part2.part3.part4';
      expect(JwtFormatRegExp.test(notJwt)).toBe(false);
    });

    it('does not match with only dots', () => {
      expect(JwtFormatRegExp.test('..')).toBe(false);
    });

    it('does not match with empty parts', () => {
      expect(JwtFormatRegExp.test('..c')).toBe(false);
      expect(JwtFormatRegExp.test('a..c')).toBe(false);
      expect(JwtFormatRegExp.test('a.b.')).toBe(false);
    });

    it('does not match with invalid Base64URL characters (spaces)', () => {
      const notJwt =
        'eyJhbGci OiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      expect(JwtFormatRegExp.test(notJwt)).toBe(false);
    });

    it('does not match with invalid Base64URL characters (plus sign)', () => {
      const notJwt =
        'eyJhbGci+iJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      expect(JwtFormatRegExp.test(notJwt)).toBe(false);
    });

    it('does not match with invalid Base64URL characters (slash)', () => {
      const notJwt =
        'eyJhbGci/iJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      expect(JwtFormatRegExp.test(notJwt)).toBe(false);
    });

    it('does not match with equals sign (padding)', () => {
      const notJwt =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9=.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      expect(JwtFormatRegExp.test(notJwt)).toBe(false);
    });

    it('does not match with newlines', () => {
      const notJwt =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\n.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      expect(JwtFormatRegExp.test(notJwt)).toBe(false);
    });

    it('does not match an API key format', () => {
      const apiKey = 'sk_test_1234567890abcdef';
      expect(JwtFormatRegExp.test(apiKey)).toBe(false);
    });

    it('does not match a random string', () => {
      const randomString = 'this is not a jwt';
      expect(JwtFormatRegExp.test(randomString)).toBe(false);
    });
  });
});

describe('isJwtFormat(token)', () => {
  it('returns true for valid JWT format', () => {
    const jwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
    expect(isJwtFormat(jwt)).toBe(true);
  });

  it('returns false for invalid JWT format', () => {
    expect(isJwtFormat('not.a.jwt!')).toBe(false);
    expect(isJwtFormat('only.two')).toBe(false);
    expect(isJwtFormat('')).toBe(false);
  });

  it('has same behavior as regex test', () => {
    const testCases = ['valid.jwt.token', 'invalid', 'two.parts', 'one.two.three.four', '', 'a.b.c'];

    testCases.forEach(testCase => {
      expect(isJwtFormat(testCase)).toBe(JwtFormatRegExp.test(testCase));
    });
  });

  it('returns true for the mockJwt fixture', () => {
    expect(isJwtFormat(mockJwt)).toBe(true);
  });

  it('returns true for the signedJwt fixture', () => {
    expect(isJwtFormat(signedJwt)).toBe(true);
  });
});
