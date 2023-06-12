import type QUnit from 'qunit';
import sinon from 'sinon';

import { mockJwks, mockJwt, mockJwtHeader, mockJwtPayload } from '../fixtures';
import { decodeJwt, verifyJwt } from './verifyJwt';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  module('decodeJwt(jwt)', () => {
    test('decodes a valid JWT', assert => {
      const { header, payload } = decodeJwt(mockJwt);
      assert.propEqual(header, mockJwtHeader);
      assert.propEqual(payload, mockJwtPayload);
      // TODO: @dimkl assert signature is instance of Uint8Array
    });

    test('throws an error if null is given as jwt', assert => {
      assert.throws(
        () => decodeJwt('null'),
        new Error('Invalid JWT form. A JWT consists of three parts separated by dots.'),
      );
    });

    test('throws an error if undefined is given as jwt', assert => {
      assert.throws(
        () => decodeJwt('undefined'),
        new Error('Invalid JWT form. A JWT consists of three parts separated by dots.'),
      );
    });

    test('throws an error if empty string is given as jwt', assert => {
      assert.throws(
        () => decodeJwt('undefined'),
        new Error('Invalid JWT form. A JWT consists of three parts separated by dots.'),
      );
    });

    test('throws an error if invalid string is given as jwt', assert => {
      assert.throws(
        () => decodeJwt('undefined'),
        new Error('Invalid JWT form. A JWT consists of three parts separated by dots.'),
      );
    });

    test('throws an error if number is given as jwt', assert => {
      assert.throws(
        () => decodeJwt('42'),
        new Error('Invalid JWT form. A JWT consists of three parts separated by dots.'),
      );
    });
  });

  module('verifyJwt(jwt, options)', hooks => {
    let fakeClock;
    hooks.beforeEach(() => {
      fakeClock = sinon.useFakeTimers(new Date(mockJwtPayload.iat * 1000).getTime());
    });
    hooks.afterEach(() => {
      fakeClock.restore();
      sinon.restore();
    });

    test('returns the valid JWT payload if valid key & issuer & azp is given', async assert => {
      const inputVerifyJwtOptions = {
        key: mockJwks.keys[0],
        issuer: mockJwtPayload.iss,
        authorizedParties: ['https://accounts.inspired.puma-74.lcl.dev'],
      };
      const payload = await verifyJwt(mockJwt, inputVerifyJwtOptions);
      assert.propEqual(payload, mockJwtPayload);
    });

    test('returns the valid JWT payload if valid key & issuer method & azp is given', async assert => {
      const inputVerifyJwtOptions = {
        key: mockJwks.keys[0],
        issuer: (iss: string) => iss.startsWith('https://clerk'),
        authorizedParties: ['https://accounts.inspired.puma-74.lcl.dev'],
      };
      const payload = await verifyJwt(mockJwt, inputVerifyJwtOptions);
      assert.propEqual(payload, mockJwtPayload);
    });

    test('returns the valid JWT payload if valid key & issuer & list of azp (with empty string) is given', async assert => {
      const inputVerifyJwtOptions = {
        key: mockJwks.keys[0],
        issuer: mockJwtPayload.iss,
        authorizedParties: ['', 'https://accounts.inspired.puma-74.lcl.dev'],
      };
      const payload = await verifyJwt(mockJwt, inputVerifyJwtOptions);
      assert.propEqual(payload, mockJwtPayload);
    });

    // todo('returns the reason of the failure when verifications fail', assert => {
    //   assert.true(true);
    // });
  });
};
