import type { JWT } from '@clerk/types';

import { encodeB64 } from '../encoders';
import { decode } from '../jwt';

const createJWTHelper = (header: JWT['header'], payload: Record<string, unknown>) => {
  const headerB64 = encodeB64(JSON.stringify(header));
  const payloadB64 = encodeB64(JSON.stringify(payload));
  const signatureB64 = encodeB64('a-string-secret-at-least-256-bits-long');

  return `${headerB64}.${payloadB64}.${signatureB64}`;
};

const jwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NzU4NzY3OTAsImRhdGEiOiJmb29iYXIiLCJpYXQiOjE2NzU4NzY3MzB9.Z1BC47lImYvaAtluJlY-kBo0qOoAk42Xb-gNrB2SxJg';

describe('decode(token)', () => {
  it('decodes a JWT token', () => {
    const parts = jwt.split('.');
    const [header, payload, signature] = parts;

    expect(decode(jwt)).toMatchObject({
      claims: {
        __raw: jwt,
        data: 'foobar',
        exp: expect.any(Number),
        iat: expect.any(Number),
      },
      encoded: {
        header,
        payload,
        signature,
      },
      header: {
        alg: 'HS256',
        typ: 'JWT',
      },
    });
  });

  it('throws an error when JWT is invalid', () => {
    expect(() => decode('')).toThrowError('JWT could not be decoded');
  });

  it('decodes versioned token', () => {
    const versionedJwt = createJWTHelper(
      {
        alg: 'HS256',
        typ: 'JWT',
        kid: '',
      },
      {
        exp: 1675876790,
        data: 'foobar',
        iat: 1675876730,
        ver: 2,
      },
    );
    const parts = versionedJwt.split('.');
    const [header, payload, signature] = parts;

    expect(decode(jwt)).toMatchObject({
      claims: {
        __raw: versionedJwt,
        data: 'foobar',
        exp: expect.any(Number),
        iat: expect.any(Number),
        ver: 2,
      },
      encoded: {
        header,
        payload,
        signature,
      },
      header: {
        alg: 'HS256',
        typ: 'JWT',
      },
    });
  });
});
