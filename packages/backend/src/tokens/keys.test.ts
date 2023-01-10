import type QUnit from 'qunit';

import { TokenVerificationError, TokenVerificationErrorAction, TokenVerificationErrorReason } from './errors';
import { loadClerkJWKFromLocal } from './keys';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  const mockJWTKey =
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA8Z1oLQbaYkakUSIYRvjmOoeXMDFFjynGP2+gVy0mQJHYgVhgo34RsQgZoz7rSNm/EOL+l/mHTqQAhwaf9Ef8X5vsPX8vP3RNRRm3XYpbIGbOcANJaHihJZwnzG9zIGYF8ki+m55zftO7pkOoXDtIqCt+5nIUQjGJK5axFELrnWaz2qcR03A7rYKQc3F1gut2Ru1xfmiJVUlQe0tLevQO/FzfYpWu7+691q+ZRUGxWvGc0ays4ACa7JXElCIKXRv/yb3Vc1iry77HRAQ28J7Fqpj5Cb+sxfFI+Vhf1GB1bNeOLPR10nkSMJ74HB0heHi/SsM83JiGekv0CpZPCC8jcQIDAQAB';
  const mockJWTKeyPEM =
    '-----BEGIN PUBLIC KEY-----\n' +
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA8Z1oLQbaYkakUSIYRvjm\n' +
    'OoeXMDFFjynGP2+gVy0mQJHYgVhgo34RsQgZoz7rSNm/EOL+l/mHTqQAhwaf9Ef8\n' +
    'X5vsPX8vP3RNRRm3XYpbIGbOcANJaHihJZwnzG9zIGYF8ki+m55zftO7pkOoXDtI\n' +
    'qCt+5nIUQjGJK5axFELrnWaz2qcR03A7rYKQc3F1gut2Ru1xfmiJVUlQe0tLevQO\n' +
    '/FzfYpWu7+691q+ZRUGxWvGc0ays4ACa7JXElCIKXRv/yb3Vc1iry77HRAQ28J7F\n' +
    'qpj5Cb+sxfFI+Vhf1GB1bNeOLPR10nkSMJ74HB0heHi/SsM83JiGekv0CpZPCC8j\n' +
    'cQIDAQAB\n' +
    '-----END PUBLIC KEY-----';
  const expectedJWK = {
    kid: 'local',
    kty: 'RSA',
    alg: 'RS256',
    n: '8Z1oLQbaYkakUSIYRvjmOoeXMDFFjynGP2-gVy0mQJHYgVhgo34RsQgZoz7rSNm_EOL-l_mHTqQAhwaf9Ef8X5vsPX8vP3RNRRm3XYpbIGbOcANJaHihJZwnzG9zIGYF8ki-m55zftO7pkOoXDtIqCt-5nIUQjGJK5axFELrnWaz2qcR03A7rYKQc3F1gut2Ru1xfmiJVUlQe0tLevQO_FzfYpWu7-691q-ZRUGxWvGc0ays4ACa7JXElCIKXRv_yb3Vc1iry77HRAQ28J7Fqpj5Cb-sxfFI-Vhf1GB1bNeOLPR10nkSMJ74HB0heHi_SsM83JiGekv0CpZPCC8jcQ',
    e: 'AQAB',
  };

  module('tokens.loadClerkJWKFromLocal(localKey)', () => {
    test('throws an error if no key has been provided', assert => {
      assert.throws(
        () => loadClerkJWKFromLocal(),
        new TokenVerificationError({
          action: TokenVerificationErrorAction.SetClerkJWTKey,
          message: 'Missing local JWK.',
          reason: TokenVerificationErrorReason.LocalJWKMissing,
        }),
      );
    });

    test('loads the local key', assert => {
      const jwk = loadClerkJWKFromLocal(mockJWTKey);
      assert.propContains(jwk, expectedJWK);
    });

    test('loads the local key in PEM format', assert => {
      const jwk = loadClerkJWKFromLocal(mockJWTKeyPEM);
      assert.propContains(jwk, expectedJWK);
    });
  });
};
