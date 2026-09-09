import { describe, expect, it } from 'vitest';

import { decode } from '../jwt';

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
});

describe('native token decoder migration', () => {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  it('preserves registered and custom claims without native coercion helpers', () => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const claims = {
      sub: 'user123',
      iss: 'https://example.com',
      aud: ['audience1', 'audience2'],
      exp: 1609459200,
      iat: 1609455600,
      nbf: 1609455800,
      jti: 'token123',
      name: 'John',
      enabled: true,
      disabled: false,
      price: 99.99,
      priceString: '99.99',
      age: 30,
      ageString: '30',
      roles: ['admin', 'user'],
      singleRole: 'admin',
      nested: { value: null },
    };
    const raw = `${encode(header)}.${encode(claims)}.signature`;
    expect(decode(raw)).toEqual({
      encoded: { header: encode(header), payload: encode(claims), signature: 'signature' },
      header,
      claims: { __raw: raw, ...claims },
    });
  });
  it.each([
    'header.body',
    'header.body.signature.extra',
    'invalid',
    '!!!.e30.signature',
    'e30.bm90X3ZhbGlkX2pzb24.signature',
  ])('rejects malformed JWT %s', raw => {
    expect(() => decode(raw)).toThrow();
  });
});
