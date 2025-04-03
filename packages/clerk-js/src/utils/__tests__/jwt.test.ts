import { decode } from '../jwt';

const jwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NzU4NzY3OTAsImRhdGEiOiJmb29iYXIiLCJpYXQiOjE2NzU4NzY3MzB9.Z1BC47lImYvaAtluJlY-kBo0qOoAk42Xb-gNrB2SxJg';

const versionedJwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NzU4NzY3OTAsImRhdGEiOiJmb29iYXIiLCJpYXQiOjE2NzU4NzY3MzAsInZlciI6Mn0.yV1pt0f3Riy6jOwPqFOmVKa93G0lqbMLjjP5KYr94zU';

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
