import type QUnit from 'qunit';

import { pemEncodedPublicKey, pemEncodedSignKey, publicJwks, signingJwks } from '../../fixtures';
import { importKey } from '../cryptoKeys';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  module('importKey(key, options)', () => {
    const algorithm = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };

    test('imports a JWK formatted private key', async assert => {
      assert.ok(await importKey(signingJwks, algorithm, 'sign'));
    });

    test('imports a JWK formatted public key', async assert => {
      assert.ok(await importKey(publicJwks, algorithm, 'verify'));
    });

    test('imports a pkcs8 formatted secret for signing', async assert => {
      assert.ok(await importKey(pemEncodedSignKey, algorithm, 'sign'));
    });

    test('imports a pkcs8 formatted secret for verification', async assert => {
      assert.ok(await importKey(pemEncodedPublicKey, algorithm, 'verify'));
    });

    test('throws an error if the key is string and not pem formatted', async assert => {
      assert.rejects(importKey('not a key', algorithm, 'sign'));
    });

    test('throws an error if the key is not a JWK', async assert => {
      assert.rejects(importKey({} as JsonWebKey, algorithm, 'sign'));
    });

    test('throws an error if a public key is imported for signing', async assert => {
      assert.rejects(importKey(pemEncodedPublicKey, algorithm, 'sign'));
    });

    test('throws an error if a private key is imported for verification', async assert => {
      assert.rejects(importKey(pemEncodedSignKey, algorithm, 'verify'));
    });
  });
};
