import jwtGen from 'jsonwebtoken';

import { decode } from './jwt';

const jwt = jwtGen.sign(
  {
    exp: Math.floor(Date.now() / 1000) + 60,
    data: 'foobar',
  },
  'secret',
);

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
