import type { Jwt } from '@clerk/types';
import type QUnit from 'qunit';
import sinon from 'sinon';

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
import { assertOk } from '../../util/testUtils';
import { decodeJwt, hasValidSignature, verifyJwt } from '../verifyJwt';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;
  const invalidTokenError = {
    reason: 'token-invalid',
    message: 'Invalid JWT form. A JWT consists of three parts separated by dots.',
  };

  module('hasValidSignature(jwt, key)', () => {
    test('verifies the signature with a JWK formatted key', async assert => {
      const { data: decodedResult } = decodeJwt(signedJwt);
      assertOk<Jwt>(assert, decodedResult);
      const { data: signatureResult } = await hasValidSignature(decodedResult, publicJwks);
      assert.true(signatureResult);
    });

    test('verifies the signature with a PEM formatted key', async assert => {
      const { data: decodedResult } = decodeJwt(signedJwt);
      assertOk<Jwt>(assert, decodedResult);
      const { data: signatureResult } = await hasValidSignature(decodedResult, pemEncodedPublicKey);
      assert.true(signatureResult);
    });

    test('it returns false if the key is not correct', async assert => {
      const { data: decodedResult } = decodeJwt(signedJwt);
      assertOk<Jwt>(assert, decodedResult);
      const { data: signatureResult } = await hasValidSignature(decodedResult, someOtherPublicKey);
      assert.false(signatureResult);
    });
  });

  module('decodeJwt(jwt)', () => {
    test('decodes a valid JWT', assert => {
      const { data } = decodeJwt(mockJwt);
      assertOk<Jwt>(assert, data);

      assert.propEqual(data.header, mockJwtHeader);
      assert.propEqual(data.payload, mockJwtPayload);
      // TODO(@dimkl): assert signature is instance of Uint8Array
    });

    test('returns an error if null is given as jwt', assert => {
      const { error } = decodeJwt('null');
      assert.propContains(error, invalidTokenError);
    });

    test('returns an error if undefined is given as jwt', assert => {
      const { error } = decodeJwt('undefined');
      assert.propContains(error, invalidTokenError);
    });

    test('returns an error if empty string is given as jwt', assert => {
      const { error } = decodeJwt('');
      assert.propContains(error, invalidTokenError);
    });

    test('throws an error if invalid string is given as jwt', assert => {
      const { error } = decodeJwt('whatever');
      assert.propContains(error, invalidTokenError);
    });

    test('throws an error if number is given as jwt', assert => {
      const { error } = decodeJwt('42');
      assert.propContains(error, invalidTokenError);
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
      const { data } = await verifyJwt(mockJwt, inputVerifyJwtOptions);
      assert.propEqual(data, mockJwtPayload);
    });

    test('returns the valid JWT payload if valid key & issuer method & azp is given', async assert => {
      const inputVerifyJwtOptions = {
        key: mockJwks.keys[0],
        issuer: (iss: string) => iss.startsWith('https://clerk'),
        authorizedParties: ['https://accounts.inspired.puma-74.lcl.dev'],
      };
      const { data } = await verifyJwt(mockJwt, inputVerifyJwtOptions);
      assert.propEqual(data, mockJwtPayload);
    });

    test('returns the valid JWT payload if valid key & issuer & list of azp (with empty string) is given', async assert => {
      const inputVerifyJwtOptions = {
        key: mockJwks.keys[0],
        issuer: mockJwtPayload.iss,
        authorizedParties: ['', 'https://accounts.inspired.puma-74.lcl.dev'],
      };
      const { data } = await verifyJwt(mockJwt, inputVerifyJwtOptions);
      assert.propEqual(data, mockJwtPayload);
    });

    test('returns the reason of the failure when verifications fail', async assert => {
      const inputVerifyJwtOptions = {
        key: mockJwks.keys[0],
        issuer: mockJwtPayload.iss,
        authorizedParties: ['', 'https://accounts.inspired.puma-74.lcl.dev'],
      };
      const { error } = await verifyJwt('invalid-jwt', inputVerifyJwtOptions);
      assert.propContains(error, invalidTokenError);
    });
  });
};
