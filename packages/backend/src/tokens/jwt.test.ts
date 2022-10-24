// /**
//  * @jest-environment jsdom
//  */

import { mockJwks, mockJwt, mockJwtHeader, mockJwtPayload } from './fixtures';
import { decodeJwt, verifyJwt } from './jwt';

describe('decodeJwt(jwt)', () => {
  test('decodes a valid JWT', () => {
    const { header, payload, signature } = decodeJwt(mockJwt);
    expect(header).toEqual(mockJwtHeader);
    expect(payload).toEqual(mockJwtPayload);
    expect(signature).toBeInstanceOf(Uint8Array);
  });

  test.each([[null], [undefined], [''], [42], ['whatever']])('throws an error if %p is given as jwt', input => {
    expect(() => decodeJwt(input as string)).toThrow(
      'Invalid JWT form. A JWT consists of three parts separated by dots.',
    );
  });
});

describe('verifyJwt(jwt, options)', () => {
  describe('when verifations succeed', () => {
    // Notice: The modern fake timers of Jest can't be used as crypto uses timers under the hood.
    //
    // So instead of
    // jest.useFakeTimers('modern');
    // jest.setSystemTime(new Date(...));
    //
    // we just mock Date.now().

    const RealDate = Date;

    beforeEach(() => {
      global.Date.now = jest.fn(() => new Date(1666099945000).getTime());
    });
    afterEach(() => {
      global.Date = RealDate;
    });

    test.each([
      [
        {
          key: mockJwks.keys[0],
          issuer: mockJwtPayload.iss,
          authorizedParties: ['https://accounts.regular.sloth-91.lcl.dev'],
        },
      ],
      [
        {
          key: mockJwks.keys[0],
          issuer: (iss: string) => iss.startsWith('https://clerk'),
          authorizedParties: ['https://accounts.regular.sloth-91.lcl.dev'],
        },
      ],
      [
        {
          key: mockJwks.keys[0],
          issuer: mockJwtPayload.iss,
          authorizedParties: ['', 'https://accounts.regular.sloth-91.lcl.dev'],
        },
      ],
    ])('returns the valid JWT payload if %p is given as verification options', async inputVerifyJwtOptions => {
      const payload = await verifyJwt(mockJwt, inputVerifyJwtOptions);
      expect(payload).toEqual({ valid: true, payload: mockJwtPayload });
    });
  });

  describe('when verifications fail', () => {
    it.todo('returns the reason of the failure');
  });
});
